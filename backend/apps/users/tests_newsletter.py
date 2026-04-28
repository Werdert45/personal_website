from django.test import TestCase

from .models import NewsletterSubscriber


class NewsletterSubscribeTests(TestCase):
    URL = "/api/auth/newsletter/subscribe/"

    def test_creates_subscriber_with_locale_and_source(self):
        response = self.client.post(
            self.URL,
            data={"email": "alice@acmecorp.io", "locale": "nl", "source": "footer"},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(NewsletterSubscriber.objects.count(), 1)
        sub = NewsletterSubscriber.objects.get()
        self.assertEqual(sub.email, "alice@acmecorp.io")
        self.assertEqual(sub.locale, "nl")
        self.assertEqual(sub.source, "footer")

    def test_normalizes_email(self):
        self.client.post(
            self.URL,
            data={"email": "  Alice@ACMECORP.IO  ", "source": "footer"},
            content_type="application/json",
        )
        sub = NewsletterSubscriber.objects.get()
        self.assertEqual(sub.email, "alice@acmecorp.io")

    def test_idempotent_does_not_overwrite_source(self):
        self.client.post(
            self.URL,
            data={"email": "alice@acmecorp.io", "locale": "en", "source": "footer"},
            content_type="application/json",
        )
        response = self.client.post(
            self.URL,
            data={"email": "alice@acmecorp.io", "locale": "nl", "source": "post-end"},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(NewsletterSubscriber.objects.count(), 1)
        sub = NewsletterSubscriber.objects.get()
        self.assertEqual(sub.locale, "en")
        self.assertEqual(sub.source, "footer")

    def test_unknown_locale_falls_back_to_en(self):
        self.client.post(
            self.URL,
            data={"email": "alice@acmecorp.io", "locale": "xx", "source": "footer"},
            content_type="application/json",
        )
        sub = NewsletterSubscriber.objects.get()
        self.assertEqual(sub.locale, "en")

    def test_disposable_email_rejected_400(self):
        response = self.client.post(
            self.URL,
            data={"email": "test@mailinator.com", "source": "footer"},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(NewsletterSubscriber.objects.count(), 0)

    def test_reactivates_unsubscribed(self):
        sub = NewsletterSubscriber.objects.create(
            email="alice@acmecorp.io",
            locale="en",
            source="footer",
            is_active=False,
        )
        response = self.client.post(
            self.URL,
            data={"email": "alice@acmecorp.io", "source": "footer"},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        sub.refresh_from_db()
        self.assertTrue(sub.is_active)
        self.assertIsNone(sub.unsubscribed_at)
