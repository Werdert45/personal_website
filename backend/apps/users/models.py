"""
Custom User model for the personal website.
"""

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.exceptions import ValidationError

# Try to import email validation packages, fall back to basic validation
try:
    from email_validator import validate_email, EmailNotValidError
    HAS_EMAIL_VALIDATOR = True
except ImportError:
    HAS_EMAIL_VALIDATOR = False

try:
    from disposable_email_checker.validators import validate_disposable_email
    from disposable_email_checker.emails import email_domain_loader
    HAS_DISPOSABLE_CHECKER = True
except ImportError:
    HAS_DISPOSABLE_CHECKER = False


# Fallback list of disposable/temporary email domains (if package not available)
DISPOSABLE_EMAIL_DOMAINS = {
    # Popular temporary email services
    'tempmail.com', 'throwaway.com', 'mailinator.com', 'guerrillamail.com',
    'temp-mail.org', '10minutemail.com', 'yopmail.com', 'fakeinbox.com',
    'trashmail.com', 'getnada.com', 'dispostable.com', 'tempail.com',
    'sharklasers.com', 'guerrillamailblock.com', 'pokemail.net', 'spam4.me',
    'throwawaymail.com', 'tempinbox.com', 'tempmailaddress.com', 'tmpmail.org',
    'tmpmail.net', 'mohmal.com', 'emailondeck.com', 'fakemail.net',
    'maildrop.cc', 'mailnesia.com', 'mintemail.com', 'mytrashmail.com',
    'getairmail.com', 'spambox.us', 'tempsky.com', 'wegwerfmail.de',
    'crazymailing.com', 'mailcatch.com', 'mailexpire.com', 'mailforspam.com',
    'mailnull.com', 'meltmail.com', 'mt2009.com', 'mt2014.com',
    'nospam.ze.tc', 'pjjkp.com', 'sharklasers.com', 'sneakemail.com',
    'sogetthis.com', 'spamfree24.org', 'spamgourmet.com', 'spaml.com',
    'tempemail.co', 'tempemail.com', 'tempemail.net', 'tempinbox.co.uk',
    'tempmail.it', 'tempomail.fr', 'temporaryemail.net', 'throwam.com',
    'throwawayemailaddress.com', 'trbvm.com', 'trillianpro.com', 'turual.com',
    'twinmail.de', 'uggsrock.com', 'veryrealemail.com', 'viditag.com',
    'viewcastmedia.com', 'viewcastmedia.net', 'viewcastmedia.org', 'webm4il.info',
    'wh4f.org', 'xagloo.com', 'yapped.net', 'yopmail.fr', 'yopmail.net',
    'you-spam.com', 'ypmail.webarnak.fr.eu.org', 'zehnminuten.de',
    'zippymail.info', 'zoaxe.com', 'zoemail.net', 'zoemail.org',
    # Common test domains
    'example.com', 'example.org', 'example.net', 'test.com',
}

# Generic email domains (personal emails - not rejected but noted)
GENERIC_EMAIL_DOMAINS = {
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com',
    'icloud.com', 'protonmail.com', 'mail.com', 'live.com', 'msn.com',
    'yahoo.co.uk', 'yahoo.fr', 'yahoo.de', 'hotmail.co.uk', 'hotmail.fr',
    'googlemail.com', 'me.com', 'mac.com', 'inbox.com', 'gmx.com',
    'gmx.de', 'gmx.net', 'web.de', 'mail.ru', 'yandex.ru', 'yandex.com',
    'zoho.com', 'fastmail.com', 'tutanota.com', 'pm.me', 'proton.me',
}


def validate_serious_email(email):
    """
    Validate that an email is legitimate and not disposable/temporary.
    Uses email-validator for syntax/deliverability and django-disposable-email-checker
    for disposable domain detection.
    """
    if not email:
        raise ValidationError("Email is required")

    email = email.lower().strip()

    # Step 1: Validate email syntax and deliverability using email-validator
    if HAS_EMAIL_VALIDATOR:
        try:
            # Validate and get normalized form
            email_info = validate_email(email, check_deliverability=True)
            email = email_info.normalized
        except EmailNotValidError as e:
            raise ValidationError(str(e))
    else:
        # Fallback: basic regex validation
        import re
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, email):
            raise ValidationError("Please enter a valid email address")

    # Step 2: Check for disposable email domains
    domain = email.split('@')[-1] if '@' in email else ''

    if HAS_DISPOSABLE_CHECKER:
        try:
            validate_disposable_email(email)
        except ValidationError:
            raise ValidationError(
                "Please use a non-disposable email address. "
                "Temporary email services are not allowed."
            )
    else:
        # Fallback: check against our list
        if domain in DISPOSABLE_EMAIL_DOMAINS:
            raise ValidationError(
                "Please use a non-disposable email address. "
                "Temporary email services are not allowed."
            )

    # Step 3: Additional spam pattern checks
    local_part = email.split('@')[0] if '@' in email else email

    # Reject emails with excessive numbers (often generated spam addresses)
    import re
    digit_count = len(re.findall(r'\d', local_part))
    if digit_count > 6 and len(local_part) > 10:
        raise ValidationError(
            "This email address appears to be auto-generated. "
            "Please use a regular email address."
        )

    # Reject obviously fake patterns
    fake_patterns = [
        r'^test\d*@', r'^fake\d*@', r'^spam\d*@', r'^noreply@',
        r'^no-reply@', r'^donotreply@', r'^asdf', r'^qwerty',
        r'^aaa+@', r'^xxx+@', r'^zzz+@',
    ]
    for pattern in fake_patterns:
        if re.match(pattern, email, re.IGNORECASE):
            raise ValidationError(
                "This email address appears to be a test or placeholder. "
                "Please use your real email address."
            )

    return email


class User(AbstractUser):
    """
    Custom user model with additional fields for the personal website.
    """

    email = models.EmailField(unique=True)
    is_admin = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    class Meta:
        db_table = "users"
        ordering = ["-created_at"]

    def __str__(self):
        return self.email


class NewsletterSubscriber(models.Model):
    """
    Newsletter subscriber model for map access gating.
    Stores email addresses of users who subscribe to view maps.
    """

    email = models.EmailField(unique=True, validators=[validate_serious_email])
    is_business_email = models.BooleanField(default=False)
    email_domain = models.CharField(max_length=255, blank=True)

    # Access tracking
    access_count = models.IntegerField(default=0)
    last_access = models.DateTimeField(null=True, blank=True)

    # Rate limiting - track access attempts per hour
    access_attempts_this_hour = models.IntegerField(default=0)
    current_hour_start = models.DateTimeField(null=True, blank=True)

    # Verification
    is_verified = models.BooleanField(default=False)
    verification_token = models.CharField(max_length=64, blank=True)
    verified_at = models.DateTimeField(null=True, blank=True)

    # Metadata
    subscribed_at = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)

    # Unsubscribe
    is_active = models.BooleanField(default=True)
    unsubscribed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "newsletter_subscribers"
        ordering = ["-subscribed_at"]

    def save(self, *args, **kwargs):
        # Extract domain from email
        if self.email and '@' in self.email:
            self.email_domain = self.email.split('@')[-1].lower()
            # Check if it's a business email (not in generic domains)
            self.is_business_email = self.email_domain not in GENERIC_EMAIL_DOMAINS

        super().save(*args, **kwargs)

    def __str__(self):
        return self.email

    def can_access_map(self):
        """
        Check if this subscriber can access maps.
        Implements rate limiting: max 10 map views per hour.
        """
        from django.utils import timezone
        from datetime import timedelta

        now = timezone.now()

        # Check if we're in a new hour window
        if self.current_hour_start is None or now >= self.current_hour_start + timedelta(hours=1):
            # Reset counter for new hour
            self.access_attempts_this_hour = 0
            self.current_hour_start = now
            self.save(update_fields=['access_attempts_this_hour', 'current_hour_start'])

        # Check if under hourly limit (10 views per hour)
        if self.access_attempts_this_hour >= 10:
            # Calculate time until reset
            time_until_reset = (self.current_hour_start + timedelta(hours=1)) - now
            minutes_remaining = int(time_until_reset.total_seconds() / 60)
            return False, f"Hourly access limit reached. Please try again in {minutes_remaining} minutes."

        return True, None

    def record_map_access(self):
        """Record a map access and update counters."""
        from django.utils import timezone
        from datetime import timedelta

        now = timezone.now()

        # Reset if we're in a new hour
        if self.current_hour_start is None or now >= self.current_hour_start + timedelta(hours=1):
            self.access_attempts_this_hour = 1
            self.current_hour_start = now
        else:
            self.access_attempts_this_hour += 1

        self.access_count += 1
        self.last_access = now
        self.save(update_fields=[
            'access_attempts_this_hour', 'current_hour_start',
            'access_count', 'last_access'
        ])

    def get_hourly_remaining(self):
        """Get the number of map views remaining this hour."""
        from django.utils import timezone
        from datetime import timedelta

        now = timezone.now()

        # If no hour window or expired, full allowance
        if self.current_hour_start is None or now >= self.current_hour_start + timedelta(hours=1):
            return 10

        return max(0, 10 - self.access_attempts_this_hour)
