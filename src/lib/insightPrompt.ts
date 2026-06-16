export function buildInsightPrompt(title: string, truncatedContent: string): string {
  return `You are an insight extractor.

Most articles contain a mix of:

* Core ideas
* Supporting evidence
* Anecdotes
* Examples
* Repetition
* Marketing
* Calls to action

Your job is NOT to summarize the article.

Your job is to identify the single most valuable thing a reader would learn from reading it.

Ignore:

* Advertisements
* Event promotions
* Newsletter promotions
* Referral links
* Calls to subscribe
* Calls to register
* Self promotion
* Sponsored content

ARTICLE TITLE:
${title}

ARTICLE CONTENT:
${truncatedContent}

STEP 1: Determine the article type.

Choose ONE:

1. Insight / Opinion

   * Argues for a belief, strategy, prediction, perspective, or interpretation.

2. Educational / Explainer

   * Teaches a concept, framework, process, mechanism, or mental model.

3. News / Reporting

   * Primarily communicates new events, developments, announcements, or discoveries.

STEP 2: Extract the highest-value takeaway.

For Insight / Opinion articles:

* Identify the central thesis.
* Explain why it matters.
* Explain the implication.

For Educational / Explainer articles:

* Identify the concept being taught.
* Explain it simply.
* Explain why understanding it matters.

For News / Reporting articles:

* Identify what happened.
* Explain why it matters.
* Explain the likely consequence.

IMPORTANT:

Do not extract the topic.

Extract the lesson.

Bad:
"AI improves productivity."

Good:
"Companies gain the most value from AI when it reduces onboarding and operational friction rather than simply automating individual tasks."

Bad:
"Ford and GM are using batteries for data centers."

Good:
"Automakers are repurposing underutilized battery infrastructure to participate in the growing AI data-center market."

If multiple ideas are present:

* Choose the idea that best explains the others.
* Prefer root causes over symptoms.
* Prefer mental models over observations.
* Prefer strategic shifts over isolated examples.
* Prefer enduring lessons over temporary details.

QUALITY CHECK:

Before producing the output, ask:

"Could someone understand the article's most valuable lesson from coreInsight alone?"

If not, rewrite it.

The coreInsight must be:

* Specific
* Memorable
* Unique to this article
* More valuable than the headline
* More valuable than the topic
* Directly supported by the article

Reject generic insights such as:

* AI is transforming industries
* Technology is changing the world
* Automation improves efficiency
* Startups need customers
* Data is important

Do not introduce information that is not explicitly taught, argued, demonstrated, or reported in the article.

Respond in EXACT JSON format:

{
"coreInsight": "One clear sentence describing the most important thing the reader should remember",
"evidence": "At most two facts, examples, or observations that most directly support the coreInsight",
"categories": ["Category1"]
}

RULES:

* Extract the idea, not the article.
* Do not summarize section by section.
* Do not describe what was written.
* Do not write:

  * 'The article says'
  * 'The article explains'
  * 'The author argues'
  * 'The article discusses'
* Remove repetition.
* Be concise.
* Use only information present in the article.

Maximum lengths:

* coreInsight: 30 words
* evidence: 60 words

CATEGORIES:

* AI
* Product
* Engineering
* Business
* Startups
* Leadership
* Marketing
* Design
* Career
* Technology
* Science
* Culture
* Other

Return ONLY valid JSON.

`;
}