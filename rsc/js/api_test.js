function movieInfo(){
    // HTML 담길 변수
    var printHTML = '';

    // 현재날짜 가져오기 (최초 실행시 오늘날짜로 실행..)
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth()+1;
    var day = now.getDate();
    month = (month.length > 1 ? ""+month : "0"+month);
    day = (day.length > 1 ? ""+day : "0"+day);
    var today = year+month+day;

    // 날짜가져오기
    var userDate = $("#SelectDate").val();

    // 인풋에서 날짜를 설정하지 않았거나, 최초 진입 시
    if( userDate == "" || typeof userDate == "undefined" ){
        userDate = today;
    } else {
        var replaceDate = userDate.replace(/-/gi,"");
        userDate = replaceDate;
    }

    // 영화국가선택
    var movieLang = $("#Nation").val();


    $.ajax({
        type: "get",
        url: "http://www.kobis.or.kr/kobisopenapi/webservice/rest/boxoffice/searchDailyBoxOfficeList.json",
        dataType:"json",
        data: {
            "key":"b09214097d3dd60509a14c88c3219256",
            "targetDt" : userDate,
            "repNationCd" : movieLang
        },
        success: function(data) {
            if( data.boxOfficeResult.dailyBoxOfficeList.length > 1 ){
                for (var i=0; i<data.boxOfficeResult.dailyBoxOfficeList.length;i++){
                    printHTML += "<tr>";
                    printHTML += "  <td class='code'>" + data.boxOfficeResult.dailyBoxOfficeList[i].movieCd + "</td>";
                    printHTML += "  <td class='name'>" + data.boxOfficeResult.dailyBoxOfficeList[i].movieNm + "</td>";
                    printHTML += "  <td class='open-date'>" + data.boxOfficeResult.dailyBoxOfficeList[i].openDt + "</td>";
                    printHTML += "  <td class='audi-count'>" + data.boxOfficeResult.dailyBoxOfficeList[i].audiCnt + "</td>";
                    printHTML += "  <td class='audi-acc'>" + data.boxOfficeResult.dailyBoxOfficeList[i].audiAcc + "</td>";
                    printHTML += "  <td class='screen-count'>" + data.boxOfficeResult.dailyBoxOfficeList[i].scrnCnt + "</td>";
                    printHTML += "  <td class='show-count'>" + data.boxOfficeResult.dailyBoxOfficeList[i].showCnt + "</td>";
                    printHTML += "</tr>";
                }
            }else{
                printHTML += "<tr>";
                printHTML += "  <td class='no-value' colspan='7'>값이 없습니다.</td>";
                printHTML += "</tr>";
            }
            $(".movie-content").empty().append(printHTML)
        }
    });
};

movieInfo();