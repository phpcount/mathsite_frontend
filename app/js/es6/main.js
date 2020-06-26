class SettingApp {

  constructor(params = null) {
    this.sessionKey = params["session-key"];
    this.name = params.name;
    this.is_update = params["is-updated"];
    this.count_news = params["count-news"];
    this.clearInterval = params.clearInterval;
    this.allowBreadcrumb = params.allowBreadcrumb;
  }

  getCountNews() {
    return this.count_news;
  }

  getBreadcrumb() {
    return this.allowBreadcrumb;
  }

  setTime(time) {
    this.time = time;
  }

  getSessionKey() {
    return this.sessionKey;
  }

  getTime() {
    return this.time;
  }

  // only dev //
  static getTime() {
    return 7000;
  }

  toString() {
    return "name: " + this.name + ", session: " + this.sessionKey;
  }
  // only dev //
}

$(function () {

  let setting = new SettingApp(defSetting);
  setting.setTime(3000);

  // Session Key for user
  $.cookie('session-key', setting.getSessionKey());

  // Fixed:SL01 (view all slides)
  $("#sliders").css("visibility", "visible");

  $('#sliders').slick({
    arrows: false,
    infinite: true,
    fade: true,
    dots: true,
    swipeToSlide: true,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: false,
    cssEase: 'linear'
    // speed: 1000,
  });


  // Swiper.js slide content
  var swiper = new Swiper('#sweeper-container', {
    spaceBetween: 30,
    speed: 800,
    slidesPerView: 3,
    centeredSlides: true,
    irection: 'vertical',
    mode: 'horizontal',
    loop: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev"
    },
    on: {
      init() {
        this.el.addEventListener('mouseenter', () => {
          this.autoplay.stop();
        });

        this.el.addEventListener('mouseleave', () => {
          this.autoplay.start();
        });
      }
    },

  });

  // Default setting param
  var
    delay = setting.getTime(),
    totalNews = setting.getCountNews(),
    startPos = 2,
    empNews = false,

    progress = false,
    arrPost = [],
    $items = null;

  let startCheckUser = setInterval(async () => {
    let res = await getMeta($.cookie('session-key'));

    if (res.status == 200 && res.data.length !== 0) {
      const data = res.data[0];
      if (data.clearInterval) {
        stopCheckUser();
      } else {
        totalNews = data['count-news'];
        console.log("User name: " + data.name + ", TotalPos:" + totalNews);
      }

    } else {
      console.log("%cget Data User: " + "error connect to server", "color: #1122cc");
      console.log("Log Out Account");
    }
    console.log("%cget Data User: " + res.status, "color: #1122cc")
  }, delay);

  let stopCheckUser = () => clearInterval(startCheckUser);

  var
    // Конпка для возврата в верх страницы
    scroll_up = $('#scroll-up'),
    // Порог для появления кнопки
    introHeight = $('#header').innerHeight(),

    scrollOffset = $(window).scrollTop();

  const checkScroll = (scrollOffset) => {
    if (scrollOffset >= introHeight) {
      scroll_up.css("display", "block");
    } else {
      scroll_up.css("display", "none");
    }
  }

  /* Fixed Header View */
  checkScroll(scrollOffset);

  // Событие при скролле
  $(window).on("scroll", function () {
    // Текущее положение на странице
    scrollOffset = $(this).scrollTop();
    checkScroll(scrollOffset);

  });




  // Smooth scroll
  var blockId = "#header";

  $('[data-scroll]').on('click', function (e) {
    e.preventDefault();
    var $this = $(this),
      blockId = $this.data('scroll');
    var blockOffset = $(blockId).offset().top;
    // console.log(blockId)

    $('html, body').animate({
      scrollTop: blockOffset
    }, 500);

  });


  $("button.widget-close-btn").on("click", function (e) {
    e.preventDefault();
    $(this).parent().css("display", "none");
  });

  // when scrolling down run ajax req
  $(window).scroll(function () {
    let upadateScroll = setInterval(() => {
      // height window + height scroll >= height of the entire document
      if ($(window).scrollTop() + $(window).height() >= $(document).height() - 200 && !progress) {
        console.log("Scrolled to end of content.");
        $items = $("#custom-scrollbar");
        if (!progress && totalNews > startPos) {
          let $this = $items.find(".news-msg");
          if (empNews && $this.is(".warning")) { $this.last().animate({ opacity: 0 }, 500, () => $this.parent().remove()); }
          console.log('Ajax');
          // get news
          $.ajax({
            url: "http://localhost:3002/news",
            type: "GET",
            // data: '_start=' + startPos + '&_limit=1',
            data: {
              _start: startPos,
              _limit: 1
            },
            // async: false,

            beforeSend: function () {
              progress = true;
            },

            success: function (data) {
              if (data !== undefined) {
                arrPost.push(...data);
                progress = false;
              } else {

                // progress = undefined;
                console.log('progress: ');
              }
            },

            complete: function () {
              /*$(".YOUR-CONTENT-DIV").mCustomScrollbar({
                theme: "dark",
              });*/
              $.each(arrPost, function (i, news) {
                // console.log($items);
                $items.append(`
                <div class="news-item op">
                  <div class="inner-wrapper">

                    <h2 class="title"><a href="#">` + news['title'] + `</a></h2>
                    
                    <div class="content-box">
                      ` + (news['img-sm'] !== null ? `<div class="img"><a href="#"><img src="` + news['img-sm'] + `" alt="" title="` + news['title'] + `"></a></div>` : ``) + `
                      <div class="desc-short desc-short-container">` + news['desc-short'] + `</div>
                      <a href="`+ news['slug'] + `" class="link btn">Подробнее...</a>
                    </div>

                    <div class="content-stats">
                      <span class="views-icon"><i class="far fa-chart-bar"></i></span>
                      <span class="views-total">`+ (news['views-total'] == 0 ? 'Просмотров за все время нет' : news['views-total'] + ' просмотров всего,') + `</span>
                      <span class="views-today">`+ (news['views-today'] == 0 ? 'сегодня нет просмотров' : news['views-today'] + ' просмотров сегодня') + `</span>
                    </div>


                    <div class="entry-meta">
                      <span class="by-author author"><a class="" href="http://teacher-math.ru/author/`+ news['author-name'] + `"><i class="fas fa-user-alt"></i>` + news['author-name'] + `</a></span>

                      <span class="date">
                        <a href="http://teacher-math.ru/2016/01/07/vladimir-putin-poruchil-pravitelstvu-rf-razrabotat-kompleks-mer-po-obnovleniyu-obshhego-obrazovaniya/"
                          title="14:10" rel="bookmark"><i class="far fa-calendar-alt"></i>
                          <time class="entry-date published" datetime="2016-01-06T12:10:54+00:00">06.01.2016</time>
                          <time class="updated hidden" datetime="2016-01-07T09:27:25+00:00">`+ news['published-at'] + `</time>
                        </a>
                      </span>
                      <span class="category"><a href="http://teacher-math.ru/category/novosti/"
                          rel="category tag"><i class="far fa-folder-open"></i>Новости</a></span>

                      <span class="comments">
                        <a href="http://teacher-math.ru/2016/01/07/vladimir-putin-poruchil-pravitelstvu-rf-razrabotat-kompleks-mer-po-obnovleniyu-obshhego-obrazovaniya/#respond"><i class="far fa-comment-dots">
                        </i>` + (news['comment'] == 0 ? 'Комментариев нет' : news['comment'] + ' коментариев') + `</a></span>
                      <!-- Meta -->
                    </div>

                    <!-- inner-wrapper -->
                  </div>

                  <!-- news item -->
                </div>
              `);
              }); //each news
              $items.find(".op").animate({ opacity: 1 }, 500);
              arrPost = [];
              startPos++;
              $(window).scroll();
              console.log("%c Complete : " + startPos, "color: #00FC09");
            },
            error: function (jqXHR, exception) {
              var msg = '';
              if (jqXHR.status === 0) {
                msg = 'Not connect.\n Verify Network.';
              } else if (jqXHR.status == 404) {
                msg = 'Requested page not found. [404]';
              } else if (jqXHR.status == 500) {
                msg = 'Internal Server Error [500].';
              } else if (exception === 'parsererror') {
                msg = 'Requested JSON parse failed.';
              } else if (exception === 'timeout') {
                msg = 'Time out error.';
              } else if (exception === 'abort') {
                msg = 'Ajax request aborted.';
              } else {
                msg = 'Uncaught Error.\n' + jqXHR.responseText;
              }
              console.error(msg);
              // $('#post').html(msg);
            }
          });

          // 
        } else { //if progress
          empNews = true;
          if ($items.find('.news-msg').is(".warning")) {
            $(this).val('Новостей пока что нет.');
            console.log('Новостей пока что нет.');
          } else {
            $items.append(`
            <div class="news-item"><div class="news-msg warning">Новостей пока что нет.</div></div>
            `);
          }

        } //onTotalScroll()
        console.log(progress);
        // $('#custom-scrollbar').mCustomScrollbar("update")
      }
    }, 3000);
  });

  // JQ End
});


const getMeta = async (cookie) => {
  // 65r2h6e26okx9o55t
  let url = "http://localhost:3002/events_user?session-key=" + cookie;
  let json_data = await axios.get(url);
  return json_data;
}

