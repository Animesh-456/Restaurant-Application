console.clear();

const fundData = {
	funds: [
		{
			name: "PH&N Canadian Money Market Fund",
			code: "1234",
			series: "F",
			assetClass: "Money Market Funds",
			risk: "low",
			mer: 0.12,
			objective:
				"He said that I was going to get to rob the bank for real. I think like a girl, I think. Not to discriminate against budgets, I feel that independent films tend to ask more questions and don't pretend to know as much as the bigger films, which tend to think they know everything. I'm not a good enough actor to become a character. Then, telling Derek Cianfrance that I'd ever I could rob a bank I'd do it on my motorcycle, and he said 'That's weird, I just wrote a script about that'."
		},
		{
			name: "PH&N Bond Fund",
			code: "8901",
			series: "F",
			assetClass: "Fixed Income Funds",
			risk: "low",
			mer: 0.34,
			objective:
				"It's nice to be around people that have a sense of the world around them, that are, in general, more conscious and conscientious. I went through puberty in a theme park. Anything happens a minute either side of that, and you're on your own. I think the one thing I love most about being an adult is the right to buy candy whenever and wherever I want. I won't eat my cereal."
		},
		{
			name: "PH&N Balanced Fund",
			code: "567",
			series: "F",
			assetClass: "Balanced Funds and Portfolio Solutions",
			risk: "low to meduim",
			mer: 0.56,
			objective:
				"I don't carry a gun. Change moves in spirals, not circles. Hey girl, I brought home a few bottles of wine since I know you needed more corks for that pinterest project. We're always changing. I could be whatever you want."
		}
	]
};

var fundTableTemplateSource = document.getElementById("fundTableTemplate")
	.innerHTML;
var fundTableTemplate = Handlebars.compile(fundTableTemplateSource);
document.getElementById("handlebarsFundTable").innerHTML = fundTableTemplate(
	fundData
);
