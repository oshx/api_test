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
    // if( userDate == "" || typeof userDate == "undefined" ){
    //     userDate = today;
    // } else {
    //     var replaceDate = userDate.replace(/-/gi,"");
    //     userDate = replaceDate;
    // }

    // 영화국가선택
    var movieLang = $("#Nation").val();


    //selector
    var content_row = $("#movie-template"); // script id
    var content_field = $(".movie-content") // view name

    // template
    var content_template = Handlebars.compile(content_row.html());

    $.ajax({
        type: "get",
        url: "http://www.kobis.or.kr/kobisopenapi/webservice/rest/boxoffice/searchDailyBoxOfficeList.json",
        dataType:"json",
        data: {
            "key":"b09214097d3dd60509a14c88c3219256",
            // "targetDt" : userDate, 변수로 가져오면 에러나는데 이유를 모르겠음
            "targetDt" : "20170101"
        },
        success: function(data) {
            var dataTemp = data.boxOfficeResult
            var template = content_template(dataTemp);
            content_field.html(template);
        }
    });
};

movieInfo();