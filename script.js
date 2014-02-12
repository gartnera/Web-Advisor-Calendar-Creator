function rawData() {
	this.courseName = null;
	this.meetingInfo = null;
	this.startEnd = null;
}
function cleanData() {
	this.courseName = null;
	this.courseId = null;
	this.courseSysId = null;

	this.startDate = null;
	this.endDate = null;
	this.type = null;
	this.days = new Array();
	this.startTime = null;
	this.endTime = null;
	this.location = "";
}

var allRawData = new Array();

var allCleanData = new Array();

function isDay(str) {
	switch (str) {
		case "Sunday":
			return true;
		case "Monday":
			return true;
		case "Tuesday":
			return true;
		case "Wednesday":
			return true;
		case "Thursday":
			return true;
		case "Friday":
			return true;
		case "Saturday":
			return true;
		default:
			return false;
	}
}


function parseTableData() {
	var tableRows = document.getElementById("GROUP_Grp_LIST_VAR6").getElementsByTagName("tr");

	var currentRow;
	var currentIndex = 2;
	while (currentRow = tableRows[currentIndex]) {
		var data = new rawData();
		var columns = currentRow.children;
		data.courseName = columns[1].innerText;
		data.meetingInfo = columns[3].innerText;
		data.startEnd = columns[4].innerText;
		currentIndex++;
		if(data.meetingInfo.indexOf("INTERNET") != -1){
			continue;
		}
		allRawData.push(data);
	}

	for (var i = 0; i < allRawData.length; ++i) {

		//Course ID and Course Name
		var newData = new cleanData();
		var current = allRawData[i];

		var splitCourseName = current.courseName.split(" ");
		var splitCourseId = splitCourseName[0].split("-");

		newData.courseSysId = splitCourseName[1].replace("(", "").replace(")", "");

		splitCourseName.shift();
		splitCourseName.shift();

		newData.courseId = splitCourseId[0] + "-" + splitCourseId[1];
		newData.courseName = splitCourseName.join(" ");
		newData.courseName = newData.courseName.trim();

		//Meeting Info
		var splitMeetingInfo = current.meetingInfo.replace(/,/g, '').split(" ");

		var dates = splitMeetingInfo[0].split("-");
		newData.startDate = dates[0];
		newData.endDate = dates[1];

		newData.type = splitMeetingInfo[1];
		//TODO: At this point, the script should stop if the class in online
		
		var dayInterator = 2;
		var currentDay = splitMeetingInfo[dayInterator];
		while (isDay(currentDay)) {
			++dayInterator;
			newData.days.push(currentDay);
			currentDay = splitMeetingInfo[dayInterator];
		}
		//day interator is now the index of the next element

		newData.startTime = splitMeetingInfo[dayInterator];
		newData.endTime = splitMeetingInfo[dayInterator + 2];

		for (var j = dayInterator + 3; j < splitMeetingInfo.length; ++j)
			newData.location += splitMeetingInfo[j] + " ";
		newData.location = newData.location.trim();

		allCleanData.push(newData);

	}
}

//some random download code I found on the internet
function download(strData, strFileName, strMimeType) {
	var D = document,
		a = D.createElement("a");
	strMimeType = strMimeType || "application/octet-stream";



	if (window.MSBlobBuilder) { //IE10+ routine
		var bb = new MSBlobBuilder();
		bb.append(strData);
		return navigator.msSaveBlob(bb, strFileName);
	} /* end if(window.MSBlobBuilder) */


	if ('download' in a) { //html5 A[download]
		a.href = "data:" + strMimeType + "," + encodeURIComponent(strData);
		a.setAttribute("download", strFileName);
		a.innerHTML = "downloading...";
		D.body.appendChild(a);
		setTimeout(function () {
			a.click();
			D.body.removeChild(a);
		}, 66);
		return true;
	} /* end if('download' in a) */


	//do iframe dataURL download (old ch+FF):
	var f = D.createElement("iframe");
	D.body.appendChild(f);
	f.src = "data:" + strMimeType + "," + encodeURIComponent(strData);

	setTimeout(function () {
		D.body.removeChild(f);
	}, 333);
	return true;
} /* end download() */

function padZero(str, len) {
	while (str.length < len) {
		str = '0' + str;
	}
	return str;
}

function createUTCDateString(date) {
	var str = date.getUTCFullYear() + padZero((date.getUTCMonth() + 1).toString(), 2) + padZero(date.getUTCDate().toString(), 2);
	str += "T" + padZero(date.getUTCHours().toString(), 2) + padZero(date.getUTCMinutes().toString(), 2) + padZero(date.getUTCSeconds().toString(), 2) + "Z";
	return str;
}

function webAdvisorDateToJavascriptDate(date, time) {
	return new Date(date + " " + time.slice(0, 5) + " " + time.slice(5));
}

function generateRecurrenceDays(dayArray) {
	var formattedDays = new Array();
	for (var i = 0; i < dayArray.length; ++i) {
		formattedDays[i] = dayArray[i].substring(0, 2).toUpperCase();
	}
	return formattedDays;
}


function createCalendarFile() {
	if (allCleanData.length == 0)
		parseTableData();
	var calendarString = "";
	calendarString += "BEGIN:VCALENDAR\r\n";
	calendarString += "PRODID:-//Class Schedule//NONSGML v1.0//EN\r\n";
	calendarString += "VERSION:2.0\r\n";
	calendarString += "X-WR-CALNAME:Class Schedule\r\n";

	var currentDateString = createUTCDateString(new Date());

	for (var i = 0; i < allCleanData.length; ++i) {
		calendarString += "BEGIN:VEVENT\r\n";
		calendarString += "DTSTAMP:" + currentDateString + "\r\n";

		var current = allCleanData[i];

		calendarString += "SUMMARY:" + current.courseName + "\r\n";
		calendarString += "LOCATION:" + current.location + "\r\n";

		var startTime = webAdvisorDateToJavascriptDate(current.startDate, current.startTime);
		var endTime = webAdvisorDateToJavascriptDate(current.startDate, current.endTime);
		calendarString += "DTSTART:" + createUTCDateString(startTime) + "\r\n";
		calendarString += "DTEND:" + createUTCDateString(endTime) + "\r\n";

		calendarString += "RRULE:FREQ=WEEKLY;UNTIL=" + createUTCDateString(new Date(current.endDate)) + ";WKST=SU;BYDAY=" + generateRecurrenceDays(current.days) + "\r\n";

		calendarString += "UID:" + current.courseSysId + "\r\n";

		calendarString += "END:VEVENT\r\n";
	}

	download(calendarString, "classes.ics", "text/calendar");

}