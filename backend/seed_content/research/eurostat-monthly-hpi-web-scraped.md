---
title: "Monthly house-price indices from web-scraped data: 13 countries for Eurostat"
slug: eurostat-monthly-hpi-web-scraped
excerpt: "Work conducted at KR&A for Eurostat: asking prices scraped from residential portals in 13 EU countries, fed through a log-price hedonic regression into monthly indices, and tested as indicator series for disaggregating Eurostat's quarterly house-price indices."
status: published
category: project
publication_status: ""
tags: ["hedonic-regression", "web-scraping", "house-prices", "eurostat", "official-statistics", "kra"]
abstract: "Official house-price indices in the EU are quarterly and arrive with a lag; asking prices on property portals update daily. Working at KR&A within the MMIT KR&A consortium for Eurostat, I worked on a pipeline that scrapes residential real-estate portals in 13 EU countries (22 million offer records covering 5.5 million properties over the first 14 months), cleans, matches and geo-enriches the records, and feeds them into log-price hedonic regressions with monthly time dummies. I built the index-calculation system: per-source configuration files that type every variable, forward variable selection, and index construction from the exponentiated time dummies, generalized so a new country's index takes hours rather than days. The monthly asking-price indices were then compared against Eurostat's transaction-based quarterly HPIs and tested as indicator series for temporal disaggregation. The results are published in a Eurostat statistical working paper."
read_time: "7 min"
date: "2026"
doi: ""
arxiv_id: ""
repo_url: ""
cite_as: ""
preview_image: ""
is_premium: false
---

# Monthly house-price indices from web-scraped data

## The problem

House prices move the macro economy, and policy makers watch them closely. But the official EU house-price indices (HPIs) are quarterly, built on transaction records, and arrive with a lag, whilst the asking prices on property portals update every day. The question Eurostat wanted answered: can web-scraped asking prices produce monthly indices sound enough to serve as indicator series for the official quarterly ones? I worked on this at KR&A, within the MMIT KR&A consortium contracted by Eurostat, and the results are published as a [Eurostat statistical working paper](https://ec.europa.eu/eurostat/web/products-statistical-working-papers/w/ks-01-26-025).

## Thirteen countries of listings

The collection side ranked roughly 100 residential portals across the EU by geography, size, representativeness and scrapability, then approached them in that order. The final selection covers 13 countries, chosen with margin in case a portal stopped cooperating or became unscrapable: 9 portals scraped monthly and 4 delivering monthly files, from Denmark's Boliga to Cyprus's Bazaraki. Collection ran from May 2023 to April 2025; the first 14 months alone yielded 22 million offer records covering 5.5 million properties, each property observed 4 times on average.

Raw scraped listings are not statistics. Every record passes through deduplication, standardization (prices arrive in thousands, with decimal points or decimal commas, in English or the local language), cleansing, matching (so a property listed across several months is tracked as one property), and enrichment: records get latitude-longitude where the source does not provide it, and from there LAU and NUTS3 regions, degree of urbanisation and population density.

## From listings to an index

The indices come from a log-price hedonic regression: regress log asking price on the property attributes plus a dummy per month, then exponentiate the time dummies to read off the index, with the first month set to 100. The idea is standard; making it run across sources that disagree about everything is the work.

I built the index-calculation system around per-source configuration files. Each config declares which variables enter the regression for that portal and what type each one is: continuous, discrete, or log-continuous. That matters for two reasons. Firstly, a continuous variable with poor coverage would silently shrink the sample, so low-coverage variables are dropped rather than allowed to throw away listings. Secondly, forcing a type is a modelling choice worth experimenting with: bedrooms as a discrete variable with an "unknown" dummy keeps sparse sources usable, but loses the ordinal meaning of the values, and the config system lets that trade-off be revisited per source without touching code. Forward variable selection then picks the composition where adding more variables stops improving the fit. Regressions run on the Eurostat-defined subsets: new versus existing dwellings, and dwellings versus plots. The whole system is generalized to the point that standing up an index for a new country takes hours rather than days.

The first two countries, chosen for their attribute coverage, were Cyprus and Denmark. The fits are decent for an object as heterogeneous as housing: R-squared around 0.5 to 0.6 for dwellings and new builds, and honestly poor for plots (0.12 in Denmark), where both the sample and the usable attributes are thin. Real estate carries attributes no scrape can see, such as distance to the sea in Cyprus, and the R-squared values say so.

## Do asking prices track transactions?

The point of the exercise is the comparison against the official transaction-based indices, and the early answer was: it depends on the country. The Cyprus asking-price index tracks the transaction-based index well, with a gap of roughly 1.3% that persists and even narrows over time. Denmark is less cooperative: the transaction index rises and then falls sharply by around 3.5%, a movement the asking-price index does not reproduce, although lagging the asking-price series by three months makes the fit look considerably better. Asking prices reacting to transactions with a delay is theoretically plausible, but with only four complete quarters of overlap at the time, no significance can be derived from it, and the report says so plainly.

The final step tested the monthly indices as indicator series for temporal disaggregation: converting the quarterly official HPI into a monthly series using methods from the Denton family through Chow-Lin, which assume the two series are cointegrated. That assumption could not yet be tested on four quarters of data, which is the honest boundary of what this phase could claim. The full two-year dataset, and the settled comparison, are in the published working paper.

## What stayed with me

This project is where I learned what production data engineering means in official statistics: the regression is one page of the report, and the other forty are source selection, information density per attribute per portal, and the processing that turns 22 million scraped offers into 20 million usable ones. It is also the project that convinced me configuration belongs in the schema rather than in the code, a principle I have carried into my own research pipelines since.
