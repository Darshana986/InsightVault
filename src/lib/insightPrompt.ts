export function buildInsightPrompt(title: string, truncatedContent: string): string {
   return `You are writing insight cards for a personal reading app.

The user may never open the article. Your job is to give them the one idea worth keeping, with enough context to understand it.

Your output should feel like something that makes a curious builder stop scrolling: clear, specific, useful, and alive.

It must not feel like a summary, a book report, an analyst note, or a list of evidence.

Ignore advertisements, event promotions, newsletter promotions, referral links, calls to subscribe, calls to register, self promotion, and sponsored content.

ARTICLE TITLE:
${title}

ARTICLE CONTENT:
${truncatedContent}

STEP 1: Classify the article as exactly one articleType:

* argument: a thesis, opinion, prediction, strategic perspective, or interpretation
* explainer: a concept, system, mechanism, process, or mental model
* news: a new event, launch, discovery, announcement, or change
* case-study: a person, company, product, incident, or story that reveals a lesson
* low-signal: mostly promotional, repetitive, generic, thin, or not meaningfully insightful

STEP 2: Write the reader-facing analysis card.

For argument:
Explain the main shift the article is arguing for. Include the old assumption, what changed, and what that changes for real people, companies, or systems.

For explainer:
Teach the concept plainly. Include the mechanism that makes it work and the practical way it changes how the reader should think.

For news:
State what changed, who is affected, and why this matters now. Do not predict consequences unless the article explicitly supports them.

For case-study:
State the specific thing that happened, then the broader lesson the example demonstrates and who should care.

For low-signal:
Do not manufacture excitement. Extract the most useful concrete point, or honestly indicate that the article offers limited reusable insight.

STYLE RULES:

* Write one compact paragraph.
* Use 2 or 3 sentences.
* Use 55 to 85 words unless the article is low-signal.
* Prefer plain language over compressed language.
* The best shape is often: what is changing, the mechanism causing it, and the key shift the reader should remember.
* Make it specific enough that it could not describe many articles with the same topic.
* Make it more useful than the headline.
* Use vivid wording only when it increases clarity.
* Do not use clickbait, hype, unsupported stakes, or invented drama.
* Do not use dense analyst phrases such as "fundamentally decoupled", "high-margin world", "AI-hungry", or "exporting a scarcity crisis".
* Do not introduce information that is not explicitly taught, argued, demonstrated, or reported in the article.
* Do not write "the article says", "the article explains", "the author argues", or "the article discusses".

BAD ANALYSIS:
The memory market has fundamentally decoupled into two distinct economies: a locked-in, high-margin world for AI-hungry hyperscalers and a volatile, supply-strained market for everyone else.

GOOD ANALYSIS:
AI is changing the memory industry from a predictable boom-bust commodity cycle into a two-tier market. Hyperscalers are locking in HBM supply through long-term contracts, protecting AI infrastructure demand while companies outside that ecosystem absorb the shortage. The key shift: AI demand is not just increasing memory consumption, it is changing who gets supply certainty and who carries the risk.

REJECT GENERIC ANALYSIS SUCH AS:

* AI is transforming industries.
* Technology is changing the world.
* Automation improves efficiency.
* Startups need customers.
* Data is important.

QUALITY CHECK BEFORE OUTPUT:

* Would this make a curious builder stop scrolling?
* Could the user understand the useful idea without opening the article?
* Is every claim directly supported by the article?
* Is this an idea, not a topic?
* If the article is boring, did you avoid pretending otherwise?

Return EXACT JSON format:

{
"analysis": "One reader-facing insight card, written as one compact paragraph",
"articleType": "argument",
"categories": ["Category1"],
"sourceBasis": "Private grounding note naming the article facts, examples, or claims that support the analysis"
}

Return ONLY valid JSON.

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

`;
}