"use strict";
/**
 * 익명으로 수행되는 전체 container
 * @param window {window}
 * @param $ {jQuery}
 * @param Handlebars {Object}
 */
!function (window, $, Handlebars) {
    var NUMBER = /\d/g;
    var VALID_DATE_FORMAT = /\d{8}/;
    // HTML class 선택자들
    var VIEW_CONFIG = {
        UI: {
            MOVIE_SEARCH_DATE_INPUT: '_searchDateInput',
            MOVIE_SEARCH_TRIGGER: '_searchTrigger',
            MOVIE_SEARCH_BY_NATION_TRIGGER: '_searchByNationTrigger',
            MOVIE_RESULT_TARGET: '_movieResult'
        },
        TEMPLATE: {
            RESULT_SUCCESS: '_movieSuccessResultTemplate',
            RESULT_FAIL: '_movieExceptionResultTemplate'
        }
    };
    var MODEL_CONFIG = {
        SEARCH_URL: 'http://www.kobis.or.kr/kobisopenapi/webservice/rest/boxoffice/searchDailyBoxOfficeList.json',
        API_KEY: 'b09214097d3dd60509a14c88c3219256'
    };
    if (!$) {
        alert('오류가 발생했습니다.');
        throw new Error('"jQuery" is required'); // jQuery 가 없음을 오류로 알림
    }
    if (!Handlebars) {
        alert('오류가 발생했습니다.');
        throw new Error('"Handlebars" is required'); // Handlebars 가 없음을 오류로 알림
    }
    // date polyfill
    if (!window.Date || typeof window.Date !== 'function') {
        alert('현재 환경에서 열 수 없습니다.');
        throw new TypeError('"window" is required'); // Date 를 수행할 수 없는 이상한 환경으로 환경 Type 오류로 알림
    }
    Date.prototype.yyyymmdd = function () {
        var mm = this.getMonth() + 1; // getMonth() is zero-based
        var dd = this.getDate();
        return [this.getFullYear(),
        (mm > 9 ? '' : '0') + mm,
        (dd > 9 ? '' : '0') + dd
        ].join('');
    };
    $(function () { // DOM ready
        var MovieApp = function (modelConfig, viewConfig) {
            var model = new MovieModel(modelConfig);
            var view = new MovieView(viewConfig);
            var controller = new MovieController(model, view);
            controller.bindEvent().search();
        };
        var MovieModel = function (config) {
            this.config = config;
        };
        MovieModel.prototype = {
            convertSearchParam: function (date, nation) {
                date = this.convertDateFormat(date);
                nation = (typeof nation !== 'string') ? '' : nation;
                return {
                    key: this.config.API_KEY,
                    targetDt: date,
                    repNationCd: nation
                }
            },
            convertDateFormat: function (date) {
                if (typeof date === 'number') { // 숫자면 문자로
                    date += '';
                }
                if (typeof date !== 'string') { // 혹시나 문자가 아니면
                    alert('오류가 발생했습니다.');
                    throw new TypeError('"date" as "String" type is required');
                }
                var formattedDate = $.trim(date).match(NUMBER);
                formattedDate = (Object.prototype.toString.call(formattedDate) === '[object Array]') ? formattedDate.join('') : '';
                return (!VALID_DATE_FORMAT.test(formattedDate)) ? new Date().yyyymmdd() : formattedDate;
            },
            getSearchUrl: function () {
                return this.config.SEARCH_URL;
            },
            convertSuccessViewData: function (response) {
                if (!response) {
                    throw new Error('검색을 못했습니다. 다시 시도해주세요.');
                }
                if (Object.prototype.toString.call(response) !== '[object Object]') {
                    throw new Error('검색 중 오류가 발생했습니다.');
                }
                if (!response.boxOfficeResult) {
                    throw new Error('검색 결과가 잘못 되어 표시할 수 없습니다.');
                }
                if (!response.boxOfficeResult.dailyBoxOfficeList ||
                    response.boxOfficeResult.dailyBoxOfficeList.length === 0) {
                    throw new Error('검색 결과가 없습니다.');
                }
                return response.boxOfficeResult;
            },
            convertFailViewData: function (response) {
                return {
                    message: (typeof response === 'string') ? response : '오류가 발생했습니다.'
                };
            }
        };
        var MovieView = function (config) {
            for (var keyName in config.UI) {
                if (!config.UI[keyName] ||
                    !config.UI.hasOwnProperty(keyName)) {
                    continue;
                }
                config.UI[keyName] = $('.' + config.UI[keyName]); // jQuery 로 DOM Mapping 해줌
            }
            for (var keyName in config.TEMPLATE) {
                if (!config.TEMPLATE ||
                    !config.TEMPLATE.hasOwnProperty(keyName)) {
                    continue;
                }
                config.TEMPLATE[keyName] = Handlebars
                    .compile(
                    $('.' + config.TEMPLATE[keyName]) // jQuery 로 DOM Mapping
                        .html() // innerHTML 을 String 으로 가져옴
                    );
            }
            this.UI = config.UI;
            this.TEMPLATE = config.TEMPLATE;
        };
        MovieView.prototype = {
            drawSuccess: function (drawData) { // 성공한 결과를 그려줌
                this.UI.MOVIE_RESULT_TARGET.html(
                    this.TEMPLATE.RESULT_SUCCESS(drawData)
                );
                return this;
            },
            drawFail: function (drawData) { // 실패한 결과를 그려줌
                this.UI.MOVIE_RESULT_TARGET.html(
                    this.TEMPLATE.RESULT_FAIL(drawData)
                );
                return this;
            }
        };
        var MovieController = function (model, view) {
            this.model = model;
            this.view = view;
        };
        MovieController.prototype = {
            bindEvent: function () {
                var _this = this;
                var UI = _this.view.UI;
                var searchFunction = $.proxy(_this.search, _this);
                UI.MOVIE_SEARCH_TRIGGER.on({
                    'click': searchFunction
                });
                UI.MOVIE_SEARCH_BY_NATION_TRIGGER.on({
                    'change': searchFunction
                });
                return this;
            },
            search: function () {
                var UI = this.view.UI;
                var date = UI.MOVIE_SEARCH_DATE_INPUT.val();
                var nation = UI.MOVIE_SEARCH_BY_NATION_TRIGGER.val();
                var successHandler = $.proxy(this.searchSuccessHandler, this);
                var failHandler = $.proxy(this.searchFailHandler, this);
                return $.ajax({
                    url: this.model.getSearchUrl(),
                    data: this.model.convertSearchParam(date, nation),
                    success: successHandler,
                    fail: failHandler,
                    error: failHandler
                });
            },
            searchSuccessHandler: function (response) {
                if (!response) {
                    return this.searchFailHandler(response);
                }
                try {
                    return this.view.drawSuccess(this.model.convertSuccessViewData(response));
                } catch (e) {
                    return this.searchFailHandler(e.message);
                }
            },
            searchFailHandler: function (response) {
                return this.view.drawFail(this.model.convertFailViewData(response));
            }
        };
        return new MovieApp(MODEL_CONFIG, VIEW_CONFIG);
    });
}(window, jQuery, Handlebars);