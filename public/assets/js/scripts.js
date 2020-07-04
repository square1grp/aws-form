"use strict"

$(document).ready(function () {
  var state;
  var motab;
  var dr = 250;

  var links = {
    'create-review': 'https://www.amazon.com/review/create-review/ref=cm_cr_arp_d_wr_but_lft?ie=UTF8&channel=reviews-product&asin='
  }
  var user = {};

  initState(3);

  function resizeNavigation() {
    let $nav = $('.navigation-button').eq(motab);
    let $tab = $('.navigation-moving-tab');
    let off = $nav.offset();
    let w = $nav.width();
    let txt = $nav.children().html();
    $tab.offset({ left: off.left - 6, top: off.top - 4 });
    $tab.width(w + 12);
    $tab.children().html(txt);
    $tab.css({ opacity: 1.0 });
  }

  function moveNavigation() {
    let $nav = $('.navigation-button').eq(motab);
    var $tab = $('.navigation-moving-tab');
    let off = $nav.offset();
    let w = $nav.width();
    var txt = $nav.children().html();

    if ($tab.css('opacity') == 0) {
      $tab.offset({ left: off.left - 6, top: off.top - 4 });
      $tab.width(w + 12);
      $tab.children().html(txt);
      $tab.css({ opacity: 1.0 });
    }

    let curOff = $tab.offset();
    let curWidth = $tab.width();

    $tab.animate({ opacity: 1.0, left: "+=" + (off.left - 6 - curOff.left), top: "+=" + (off.top - 4 - curOff.top), width: "+=" + (w + 12 - curWidth) }, dr * 2);
    if (txt != $tab.children().html()) {
      $tab.children().animate({ opacity: 0.0 }, dr / 2, function () {
        $tab.children().html(txt).delay(dr * 1.5).animate({ opacity: 1.0 }, dr * 1.5);
      });
    }
  }

  function initState(...args) {
    var $wizard = $('.wizard-body');
    var html;

    switch (args[0]) {
      case 0:
        // Start screen.
        (function () {
          motab = 0;
          html = `
				<div class="wizard-text">
					<h4 class="text-info">${texts['00_text-info-1']}</h4>
					<p class="text-find-it"><a href="${texts['00_find-it-here-link']}" target="_blank">${texts['00_find-it-here']}</a></p>
				</div>
				<form class="form-order-id">
					<label class="order-id-label" for="OrderId">${texts['00_order-id-label']}</label>
					<input class="order-id-input" id="OrderId" name="OrderId" type="text" value="" maxlength="30" autocomplete="off">
          <label id="errorMessage" class="order-id-error" for="OrderId"></label>
        </form>
          
        <div class="wizard-text">
          <h4 class="text-info" style="width: 100%; margin: 0px;">${texts['00_text-info-2']}</h4>
        </div>
        `;

          $wizard.html(html);

          $('form').off('submit');
          $('.order-id-input').off('input focus blur');

          $('form').submit(false);

          $('.order-id-input').on('input focus blur', function (e) {
            inputCheck(e.type, $(e.target));
          });

          function inputCheck(type, $elm) {
            var ret = false;
            var reg = /^[0-9]{3}\-[0-9]{7}\-[0-9]{7}$/;
            var txt = '';
            var val = $elm.val();
            if (val) {
              if (!reg.test(val)) {
                txt = texts['00_order-id-error'];
                reg = /^[0-9]{1,3}$|^[0-9]{3}\-?$|^[0-9]{3}\-[0-9]{1,7}$|^[0-9]{3}\-[0-9]{7}\-?$|^[0-9]{3}\-[0-9]{7}\-[0-9]{1,6}$/;
                if (type != 'blur') if (reg.test(val)) { txt = ''; }
              } else {
                ret = true;
              }
            }
            var $err = $('#errorMessage');
            var msg = $('#errorMessage').html();
            if (txt != msg) {
              $err.animate({ opacity: 0.0 }, dr / 2, function () {
                if (txt != '') {
                  $err.html(txt).css({ opacity: 0.0, visibility: 'visible' });
                  $err.animate({ opacity: 1.0 }, dr);
                } else {
                  $err.html(txt).css({ opacity: 0.0, visibility: 'hidden' });
                }
              });
            }
            if (ret) {
              $('.order-id-input').off('input focus blur');

              API({ 'order': val }, 'check-order');
              function API(json, action) {
                var data = {};
                data['action'] = action;
                data['json'] = JSON.stringify(json);

                $.ajax({
                  type: 'POST',
                  url: '/',
                  data: data,
                  timeout: 12000,
                  success: urlSuccess,
                  error: urlError,
                  complete: urlComplete,
                  dataType: 'json'
                });

                function urlSuccess(arr, txtStatus, xhr) {
                  if (arr['status'] == 'success') {
                    console.log('Success', arr);
                    if (arr['order']) {
                      links['create-review'] += arr['asin'];

                      user = {};
                      user['buyer'] = arr['buyer'];
                      user['order'] = arr['order'];
                      user['sku'] = arr['sku'];
                      user['asin'] = arr['asin'];
                      user['title'] = arr['title'];

                      closeState(2);
                    } else {
                      closeState(1, arr['answer']);
                    }
                  }
                  else {
                    console.log('Error', arr);
                  }
                }

              }
            }
          }
        })();
        break;
      case 1:
        // The order number is correct, but we can not continue.
        (function () {
          motab = 0;
          html = `
				<div class="wizard-text">
					<h4 class="text-info-after-stars">${args[1]}</h4>
					<p class="text-find-it"><a href="${texts['00_find-it-here-link']}" target="_blank">${texts['00_find-it-here']}</a></p>
				</div>`;

          $wizard.html(html);
        })();
        break;
      case 2:
        // The order number is correct and we can continue. Screen with the stars.
        (function () {
          motab = 0;
          let stars = repeat('<span class="text-star"></span>', 5);
          html = `
            <div class="wizard-text">
              <p class="text-rate">${texts['02_text-rate']}</p>
            </div>
            <div class="wizard-stars">
              <p class="text-stars">${stars}</p>
            </div>
            <div class="wizard-text">
              <h4 class="text-info-after-stars"></h4>
              <p class="text-find-it"><a href="" id="findAnother"></a></p>
            </div>`;

          $wizard.html(html);

          $('.text-star').off('mouseover mouseout mouseleave click');

          $('.text-star').on('mouseover', function (e) {
            var n = $('.text-star').index($(e.target));
            $('.text-star:lt(' + (n + 1) + ')').addClass('text-star__yellow');
          });

          $('.text-star').on('mouseout mouseleave', function (e) {
            $('.text-star').removeClass('text-star__yellow');
          });

          $('.text-star').on('click', function (e) {
            $('.text-star').off('mouseover mouseout mouseleave click');
            var n = $('.text-star__yellow').length;
            var $elm = $('h4.text-info-after-stars');
            var txt;
            var go;
            user['stars'] = n;
            switch (n) {
              case 5:
                txt = texts['02_rating5'];
                go = 4;
                break;
              case 4:
                txt = texts['02_rating4'];
                go = 3;
                break;
              default:
                go = 8;
                txt = texts['02_rating13'];
            }
            $elm.animate({ opacity: 0.0 }, dr, function () {
              $elm.html(txt);
              $elm.animate({ opacity: 1.0 }, dr * 2, function () {
                setTimeout(function () { if (go !== false) closeState(go); }, dr * 4);
              });
            });
          });
        })();
        break;
      case 3:
      case 4:
        // 4 or 5 stars and an offer to leave a review on Amazon.
        (function () {
          motab = 1;
          let stars = repeat('<span class="text-star__yellow" />', 4) + '<span class="text-star' + (user['stars'] > 4 ? "__yellow" : "") + '"/>';
          let is_input_ok = false;

          html = `
            <div class="wizard-stars">
              <p class="text-stars">${stars}</p>
            </div>
            <div class="wizard-text">
              <h4 class="text-info">${texts['04_text-info']}</h4>
            </div>
            <form class="form-email-short">
              <label class="comment-label" for="comment">Your comment</label>
              <textarea class="comment-input" id="comment" name="comment" rows="5" cols="65"></textarea>
              <label id="errorComment" class="comment-error" for="comment">${texts['04_comment-error']}</label>
            </form>
            <div class="wizard-leave-feedback">
              <h3 class="text-leave-feedback"><a class="leave-button orange" href="javascript:void(0)">${texts['04_leave-feedback']}</a></h3>
            </div>
            <div id="popup">
              <p>You have copied your comment - you can paste this in the next step</p>
              <a href="javascript:void(0)">OK</a>
            </div>`;

          $wizard.html(html);

          $('.wizard-leave-feedback a').off('click');

          $('.wizard-leave-feedback a').click(function (e) {
            if (is_input_ok) {
              user['comment'] = $('#comment').val();

              API(user, 'save-comment');

              function API(json, action) {
                var data = {};
                data['action'] = action;
                data['json'] = JSON.stringify(json);

                $.ajax({
                  type: 'POST',
                  url: '/',
                  data: data,
                  timeout: 12000,
                  success: urlSuccess,
                  error: urlError,
                  complete: urlComplete,
                  dataType: 'json'
                });

                function urlSuccess(arr, txtStatus, xhr) {
                  if (arr['status'] == 'success') {
                    /* Get the text field */
                    var copyText = document.getElementById("comment");

                    /* Select the text field */
                    copyText.select();
                    copyText.setSelectionRange(0, 99999); /*For mobile devices*/

                    /* Copy the text inside the text field */
                    document.execCommand("copy");

                    var $popup = $("#popup");
                    $popup.show();
                    window.getSelection().removeAllRanges();

                    $(e.target).off('click');

                    $("#popup a").click(function () {
                      $popup.hide();

                      closeState(4.5);
                    });
                  }
                  else {
                    console.log('Error', arr);
                  }
                }
              }
            } else {
              var $err = $('#errorComment');
              $err.animate({ opacity: 0.0 }, dr / 2, function () {
                $err.html(texts['04_comment-error']).css({ opacity: 0.0, visibility: 'visible' });
                $err.animate({ opacity: 1.0 }, dr);
              });
            }

            return true;
          });

          $('form').off('submit');
          $('.comment-input').off('input focus blur');

          $('form').submit(false);

          $('.comment-input').on('input focus blur', function (e) {
            is_input_ok = inputCheck(e.type, $(e.target));
          });

          function inputCheck(type, $elm) {
            var ret = false;
            var txt = '';
            var val = $elm.val().trim();
            if (val) {
              if (val.length < 15) {
                txt = texts['04_comment-error'];

                if (type != 'blur' && val.length != 15) { txt = ''; }
              } else {
                ret = true;
              }
            }
            var $err = $('#errorComment');
            var msg = $('#errorComment').html();
            if (txt != msg) {
              $err.animate({ opacity: 0.0 }, dr / 2, function () {
                if (txt != '') {
                  $err.html(txt).css({ opacity: 0.0, visibility: 'visible' });
                  $err.animate({ opacity: 1.0 }, dr);
                } else {
                  $err.html(txt).css({ opacity: 0.0, visibility: 'hidden' });
                }
              });
            }

            return ret;
          }
        })();
        break;
      case 4.5:
        (function () {
          motab = 1;

          html = `
            <div class="wizard-text">
              <h4 class="text-info">${texts['04_text-info-2']}</h4>
            </div>
            <div class="wizard-leave-feedback">
              <h3 class="text-leave-feedback"><a class="leave-button orange" href="https://www.amazon.com/gp/css/order-history" target="_blank">${texts['04_leave-feedback-2']}</a></h3>
              <p class="text-leave-small"><a href="https://www.amazon.com/gp/css/order-history" target="_blank">${texts['04_small-feedback']}</a></p>
            </div>
            <div class="wizard-leave-feedback">
              <h4 class="text-info"><a href="https://www.amazon.com/gp/css/order-history" target="_blank">${texts['04_write-a-review']}</a></h4>
            </div>
            <div class="wizard-text">
              <p style="margin-left: 10%; margin-right: 10%;">${texts['04_text-after-write-a-review']}</p>
            </div>`;

          $wizard.html(html);

          $('.wizard-leave-feedback a').off('click');

          $('.wizard-leave-feedback a').click(function (e) {
            $('.wizard-leave-feedback a').off('click');
            closeState(5);
            return true;
          });
        })();
        break;
      case 5:
        // Timer receiving the voucher.
        (function () {
          motab = 1;
          let dots = repeat('<span class="text-dot"></span>', 9);
          html = `
				<div class="wizard-text">
					<h4 class="text-info">${texts['05_text-info']}</h4>
				</div>
				<div class="wizard-text-timer">
					<h3 class="text-timer-dots">${dots}</h3>
				</div>`;

          $wizard.html(html);

          setTimeout(greenDot, dr * 4);
          function greenDot() {
            var $allDots = $('.text-timer-dots').children();
            var $activeDots = $('.text-timer-dots').children('.text-dot__green');
            if ($activeDots.length < $allDots.length) {
              $('.text-dot:eq(' + ($activeDots.length) + ')').addClass('text-dot__green');
              setTimeout(greenDot, dr * 4);
            } else { closeState(6); }
          }
        })();
        break;
      case 6:
        // Email entry form 4-5.
        (function () {
          motab = 2;
          html = `
            <div class="wizard-text">
              <h4 class="text-info">${texts['06_text-email-45']}</h4>
            </div>
            <form class="form-email-short">
              <div class="form-group-row">
                <div class="form-group-col">
                  <label class="first_name-label required" for="first_name">First Name</label>
                  <input class="first_name-input" id="first_name" name="first_name" type="text" value="" maxlength="60" autocomplete="off" required>
                </div>
                
                <div class="form-group-col">
                  <label class="last_name-label required" for="last_name">Last Name</label>
                  <input class="last_name-input" id="last_name" name="last_name" type="text" value="" maxlength="60" autocomplete="off" required>
                </div>
              </div>

              <div class="form-group-row">
                <div class="form-group-col">
                  <label class="email-label required" for="email">Email</label>
                  <input class="email-input" id="email" name="email" type="email" value="" maxlength="60" autocomplete="off" required>
                </div>
              </div>

              <div class="form-group-row">
                <div class="form-group-col">
                  <label class="address-label required" for="email">Address</label>
                  <input class="address-input" id="address" name="address" type="text" value="" maxlength="60" autocomplete="off" required>
                </div>
              </div>

              <div class="form-group-row">
                <div class="form-group-col">
                  <label class="city-label required" for="city">City</label>
                  <input class="city-input" id="city" name="city" type="text" value="" maxlength="60" autocomplete="off" required>
                </div>
                
                <div class="form-group-col">
                  <label class="state-label required" for="state">State</label>
                  <input class="state-input" id="state" name="state" type="text" value="" maxlength="60" autocomplete="off" required>
                </div>
              </div>

              <div class="form-group-row">
                <div class="form-group-col">
                  <label class="zipcode-label required" for="email">Zip code</label>
                  <input class="zipcode-input" id="zipcode" name="zipcode" type="text" value="" maxlength="60" autocomplete="off">
                </div>
                
                <div class="form-group-col">
                  <label class="phone-label" for="phone">Phone</label>
                  <input class="phone-input" id="phone" name="phone" type="text" value="" maxlength="60" autocomplete="off">
                </div>
              </div>

              <br/>

              <input type="checkbox" id="receive_by_email" class="receive_by" value="email">
              <label for="receive_by_email">Yes! Please sign me up to receive offers in my email.</label><br/>
              <input type="checkbox" id="receive_by_sms" class="receive_by" value="sms">
              <label for="receive_by_sms">Yes! Please sign me up to receive offers by text message.</label><br/>

              <br/>

              <button submit>Submit</button>
            </form>
            </div>`;

          $wizard.html(html);

          $('form').off('submit');

          $('form').submit(function () {
            var data = {};
            data['action'] = 'make-an-offer';

            var receive_by = [];

            $.each($("input[type=checkbox].receive_by:checked"), function (idx, ele) {
              receive_by.push($(ele).val());
            });

            data['json'] = JSON.stringify({
              first_name: $("#first_name").val().trim(),
              last_name: $("#last_name").val().trim(),
              email: $("#email").val().trim(),
              address: $("#address").val().trim(),
              city: $("#city").val().trim(),
              state: $("#state").val().trim(),
              zipcode: $("#zipcode").val().trim(),
              phone: $("#phone").val().trim(),
              receive_by: receive_by
            });

            $.ajax({
              type: 'POST',
              url: '/',
              data: data,
              timeout: 12000,
              success: urlSuccess,
              error: urlError,
              complete: urlComplete,
              dataType: 'json'
            });

            function urlSuccess(arr, txtStatus, xhr) {
              if (arr['status'] == 'success') {
                closeState(7);
              }
              else {
                console.log('Error', arr);
              }
            }

            return false;
          });
        })();
        break;
      case 7:
        // Final for 4-5.
        (function () {
          motab = 2;
          html = `
					<div class="wizard-text">
						<h4 class="text-info">${texts['07_text-final-45']}</h4>
					</div>
					<div class="wizard-text-support">
						<h4 class="text-info-support">${texts['07_support-45']}</h4>
						<p class="text-support">${texts['07_email-link-45']}</p>
					</div>
					<div class="wizard-text">
						<h4 class="text-info-thanks">${texts['07_thank-you-45']}</h4>
					</div>`;

          $wizard.html(html);
        })();
        break;
      case 8:
        // Email entry form 1-3.
        (function () {
          motab = 0;
          html = `
				<div class="wizard-text">
					<h4 class="text-info-top">${texts['08_text-top-13']}</h4>
					<h4 class="text-info-short">${texts['08_text-email-13']}</h4>
				</div>
				<form class="form-email-short">
					<label class="email-label" for="email">${texts['08_buyer-email']}</label>
					<input class="email-input" id="email" name="email" type="text" value="" maxlength="60" autocomplete="off">
					<label id="errorMessage" class="email-error" for="email">${texts['08_email-error']}</label>
				</form>
				<div class="wizard-text"><p id="emailSend" class="text-send-it__disabled" style="opacity: 0.35;">${texts['08_send']}</p></div>
				<div class="wizard-text-short">
					<p class="text-mistake">${texts['08_mistake']}</p>
				</div>`;

          $wizard.html(html);

          $('form').off('submit');
          $('.email-input').off('input focus blur');

          $('form').submit(false);

          $('.email-input').on('input focus blur', function (e) {
            inputCheck(e.type, $(e.target));
          });

          function inputCheck(type, $elm) {
            var ret = false;
            var reg = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;
            var txt = '';
            var val = $elm.val().trim();
            if (val) {
              if (!reg.test(val)) {
                txt = texts['08_email-error'];
                reg = /^[^@\s]+$|^[^@\s]+@$|^[^@\s]+@[^@\s]+$|^[^@\s]+@[^@\s]+\.$|^[^@\s]+@[^@\s]+\.[^@\s]{1}$/;
                if (type != 'blur') if (reg.test(val)) { txt = ''; }
              } else {
                ret = true;
              }
            }
            var $err = $('#errorMessage');
            var msg = $('#errorMessage').html();
            if (txt != msg) {
              $err.animate({ opacity: 0.0 }, dr / 2, function () {
                if (txt != '') {
                  $err.html(txt).css({ opacity: 0.0, visibility: 'visible' });
                  $err.animate({ opacity: 1.0 }, dr);
                } else {
                  $err.html(txt).css({ opacity: 0.0, visibility: 'hidden' });
                }
              });
            }
            if (ret) {
              user['email'] = val;
              $('#emailSend').removeClass('text-send-it__disabled').addClass('text-send-it').off('click').on('click', function (e) {
                $(e.target).off('click');
                $('.email-input').off('input focus blur')
                API(user, 'save-email');

                function API(json, action) {
                  var data = {};
                  data['action'] = action;
                  data['json'] = JSON.stringify(json);

                  $.ajax({
                    type: 'POST',
                    url: '/',
                    data: data,
                    timeout: 12000,
                    success: urlSuccess,
                    error: urlError,
                    complete: urlComplete,
                    dataType: 'json'
                  });

                  function urlSuccess(arr, txtStatus, xhr) {
                    if (arr['status'] == 'success') {
                      closeState(9);
                    }
                    else {
                      console.log('Error', arr);
                    }
                  }
                }

              }).animate({ opacity: 1.0 }, dr);
            }
            else {
              $('#emailSend').removeClass('text-send-it').addClass('text-send-it__disabled').off('click').animate({ opacity: .35 }, dr);
            }
          }
        })();
        break;
      case 9:
        // Final for 1-3.
        (function () {
          motab = 0;
          html = `
					<div class="wizard-text">
						<h4 class="text-info">${texts['09_text-final-13']}</h4>
					</div>
					<div class="wizard-text-support">
						<h4 class="text-info-support">${texts['09_support-13']}</h4>
						<p class="text-support">${texts['09_email-link-13']}</p>
					</div>
					<div class="wizard-text">
						<h4 class="text-info">${texts['09_thank-you-13']}</h4>
					</div>`;

          $wizard.html(html);
        })();
        break;
      default:
        break;
    }
    state = args[0];
    moveNavigation();
    $wizard.animate({ opacity: 1.0 }, dr * 2);
  }

  function closeState(...args) {
    var $wizard = $('.wizard-body');
    $wizard.animate({ opacity: 0.0 }, dr, function () {
      $wizard.html('');
      initState(...args);
    });
  }

  function urlError(xhr, txtStatus, http) {
    console.log('Data transfer error: ' + txtStatus + ((txtStatus == http || http.toString().replace(' ', '') == '') ? '' : ' ' + http) + ' ' + xhr.status);
  }

  function urlComplete(xhr, txtStatus) {
  }

  $(window).resize(function () {
    resizeNavigation();
  });

  function repeat(str, count) {
    var ret = '';
    for (let i = 0; i < count; i++) ret += String(str);
    return ret;
  }

});