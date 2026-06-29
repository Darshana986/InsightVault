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

STEP 2: Choose exactly one insightDepth:

* compact: 55-75 words
   Use when the article has one useful idea and little necessary context.

* standard: 80-115 words
   Use when the article has one main idea plus important context, mechanism, or stakes.

* deep: 120-170 words
   Use when the useful idea depends on multiple connected parts, such as a market structure change, framework, tradeoff, technical mechanism, long case study, or layered argument.

* low-signal: 45-65 words
   Use when the article is thin, repetitive, promotional, generic, or mostly obvious.

DEPTH RULES:

* Choose the shortest depth that preserves the useful idea.
* Do not choose deep just because the article is long.
* Do not choose compact if it forces vague or compressed language.
* Never exceed 170 words.
* Never write fewer than 45 words.

STEP 3: Write the reader-facing analysis card.

For argument:
Explain the main shift the article is arguing for. Include the old assumption, what changed, the concrete mechanism, and what that changes for real people, companies, or systems.

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
* Follow the word range for the selected insightDepth.
* Use 1 or 2 sentences for compact and low-signal.
* Use 2 or 3 sentences for standard.
* Use 3 to 5 sentences for deep.
* Prefer simple, everyday words over compressed or impressive-sounding language.
* Write like a smart friend explaining the idea, not like a consultant, academic, or market analyst.
* If a simpler word works, use it.
* The best shape is often: what is changing, the mechanism causing it, and the key shift the reader should remember.
* Stay at the concrete mechanism level, not the market-abstraction level.
* Use at least one concrete source detail when it carries the insight: a number, named buyer group, contract type, price change, product type, physical constraint, or company example.
* Do not replace concrete source details with vague abstractions.
* Name who benefits and who absorbs the cost when the article makes that clear.
* Make it specific enough that it could not describe many articles with the same topic.
* Make it more useful than the headline.
* Use vivid wording only when it increases clarity.
* Do not use clickbait, hype, unsupported stakes, or invented drama.
* Do not use dense or showy phrases such as "fundamentally decoupled", "high-margin world", "AI-hungry", "paradigm shift", "inflection point", "structural transformation", "unprecedented disruption", or "exporting a scarcity crisis".
* Avoid fancy verbs like "leverage", "unlock", "catalyze", "redefine", "reshape", and "optimize" when simpler verbs like "use", "change", "create", "make", or "improve" would work.
* Avoid vague abstraction words like "bifurcating", "ecosystem", "strategic asset", "market dynamics", "demand environment", and "structural shift" unless no simpler wording is accurate.
* Do not introduce information that is not explicitly taught, argued, demonstrated, or reported in the article.
* Do not write "the article says", "the article explains", "the author argues", or "the article discusses".

BAD ANALYSIS:
AI is bifurcating the memory market, ending the era of a single, uniform commodity cycle. Hyperscalers are now using long-term, take-or-pay contracts to guarantee supply, effectively creating a protected tier for AI infrastructure. Because high-bandwidth memory chips are more physically demanding to produce, this surge consumes the very manufacturing capacity once used for general-purpose hardware.

GOOD ANALYSIS:
AI is not just increasing demand for memory; it is deciding who gets memory first. Cloud companies are locking in HBM with long-term contracts, while those chips use roughly three times the wafer area of ordinary DDR5. The squeeze lands on everyone outside the AI buildout: carmakers, industrial suppliers, and PC builders buying scarcer chips at higher prices.

CONCRETENESS EXAMPLES:

Bad: "physically demanding to produce"
Good: "uses roughly three times the wafer area of ordinary DDR5"

Bad: "companies outside that ecosystem"
Good: "carmakers, industrial suppliers, and PC builders"

Bad: "memory is becoming a strategic asset"
Good: "cloud companies are locking in memory before other buyers can get it"

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
"insightDepth": "standard",
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