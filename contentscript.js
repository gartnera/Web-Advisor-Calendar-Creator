//only inject if page title is Schedule
if (document.title == "Schedule") {
	var injectionPoint = document.getElementsByClassName("submit OK")[0];
	injectionPoint.innerHTML += "<input type=\"button\" name=\"OK2\" value=\"Generate Calendar\" class=\"shortButton\" style=\"width:160px\" onclick=\"javascript:createCalendarFile()\">";
	var s = document.createElement('script');
	s.src = chrome.extension.getURL("script.js");
	s.onload = function () {
		this.parentNode.removeChild(this);
	};
	(document.head || document.documentElement).appendChild(s);
}