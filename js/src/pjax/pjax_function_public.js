/*所有的pjax操作封装*/
function category_js () {
  // if ($(".jiantou").length==0) {
  //   $("<div class='jiantou' style='float: left'> &nbsp>&nbsp </div>").prependTo(".category-list-item");
  // }
  $(".category-list-link").filter(function () {
    return $(this).siblings(".category-list-child").length>0
  }).attr("href","javascript:void(0)");
  $(".category-list-link").click(function () {
    $(this).siblings(".category-list-child").slideToggle();
  })
  // var width = ($(window).width())/1.2;
  var width = ($(".main-inner").width())/1.2;
  // console.log(width)
  $(".category-list-link").animate({width: width},300)

}
function opacity_js() {
  $(".post-block").css({opacity:1});
  $(".post-header").css({opacity:1});
  $(".post-body").css({opacity:1});
  $(".pagination").css({opacity:1});
}
/* global NexT: true */

function motion_js() {
  NexT.motion = {};

  var sidebarToggleLines = {
    lines: [],
    push: function (line) {
      this.lines.push(line);
    },
    init: function () {
      this.lines.forEach(function (line) {
        line.init();
      });
    },
    arrow: function () {
      this.lines.forEach(function (line) {
        line.arrow();
      });
    },
    close: function () {
      this.lines.forEach(function (line) {
        line.close();
      });
    }
  };

  function SidebarToggleLine(settings) {
    this.el = $(settings.el);
    this.status = $.extend({}, {
      init: {
        width: '100%',
        opacity: 1,
        left: 0,
        rotateZ: 0,
        top: 0
      }
    }, settings.status);
  }

  SidebarToggleLine.prototype.init = function () {
    this.transform('init');
  };
  SidebarToggleLine.prototype.arrow = function () {
    this.transform('arrow');
  };
  SidebarToggleLine.prototype.close = function () {
    this.transform('close');
  };
  SidebarToggleLine.prototype.transform = function (status) {
    this.el.velocity('stop').velocity(this.status[status]);
  };

  var sidebarToggleLine1st = new SidebarToggleLine({
    el: '.sidebar-toggle-line-first',
    status: {
      arrow: {width: '50%', rotateZ: '-45deg', top: '2px'},
      close: {width: '100%', rotateZ: '-45deg', top: '5px'}
    }
  });
  var sidebarToggleLine2nd = new SidebarToggleLine({
    el: '.sidebar-toggle-line-middle',
    status: {
      arrow: {width: '90%'},
      close: {opacity: 0}
    }
  });
  var sidebarToggleLine3rd = new SidebarToggleLine({
    el: '.sidebar-toggle-line-last',
    status: {
      arrow: {width: '50%', rotateZ: '45deg', top: '-2px'},
      close: {width: '100%', rotateZ: '45deg', top: '-5px'}
    }
  });

  sidebarToggleLines.push(sidebarToggleLine1st);
  sidebarToggleLines.push(sidebarToggleLine2nd);
  sidebarToggleLines.push(sidebarToggleLine3rd);

  var SIDEBAR_WIDTH = '320px';
  var SIDEBAR_DISPLAY_DURATION = 200;
  var xPos, yPos;

  var sidebarToggleMotion = {
    toggleEl: $('.sidebar-toggle'),
    dimmerEl: $('#sidebar-dimmer'),
    sidebarEl: $('.sidebar'),
    isSidebarVisible: false,
    init: function () {
      this.toggleEl.on('click', this.clickHandler.bind(this));
      this.dimmerEl.on('click', this.clickHandler.bind(this));
      this.toggleEl.on('mouseenter', this.mouseEnterHandler.bind(this));
      this.toggleEl.on('mouseleave', this.mouseLeaveHandler.bind(this));
      this.sidebarEl.on('touchstart', this.touchstartHandler.bind(this));
      this.sidebarEl.on('touchend', this.touchendHandler.bind(this));
      this.sidebarEl.on('touchmove', function(e){e.preventDefault();});

      $(document)
        .on('sidebar.isShowing', function () {
          NexT.utils.isDesktop() && $('body').velocity('stop').velocity(
            {paddingRight: SIDEBAR_WIDTH},
            SIDEBAR_DISPLAY_DURATION
          );
        })
        .on('sidebar.isHiding', function () {
        });
    },
    clickHandler: function () {
      this.isSidebarVisible ? this.hideSidebar() : this.showSidebar();
      this.isSidebarVisible = !this.isSidebarVisible;
    },
    mouseEnterHandler: function () {
      if (this.isSidebarVisible) {
        return;
      }
      sidebarToggleLines.arrow();
    },
    mouseLeaveHandler: function () {
      if (this.isSidebarVisible) {
        return;
      }
      sidebarToggleLines.init();
    },
    touchstartHandler: function(e) {
      xPos = e.originalEvent.touches[0].clientX;
      yPos = e.originalEvent.touches[0].clientY;
    },
    touchendHandler: function(e) {
      var _xPos = e.originalEvent.changedTouches[0].clientX;
      var _yPos = e.originalEvent.changedTouches[0].clientY;
      if (_xPos-xPos > 30 && Math.abs(_yPos-yPos) < 20) {
        this.clickHandler();
      }
    },
    showSidebar: function () {
      var self = this;

      sidebarToggleLines.close();

      this.sidebarEl.velocity('stop').velocity({
          width: SIDEBAR_WIDTH
        }, {
          display: 'block',
          duration: SIDEBAR_DISPLAY_DURATION,
          begin: function () {
            $('.sidebar .motion-element').velocity(
              'transition.slideRightIn',
              {
                stagger: 50,
                drag: true,
                complete: function () {
                  self.sidebarEl.trigger('sidebar.motion.complete');
                }
              }
            );
          },
          complete: function () {
            self.sidebarEl.addClass('sidebar-active');
            self.sidebarEl.trigger('sidebar.didShow');
          }
        }
      );

      this.sidebarEl.trigger('sidebar.isShowing');
    },
    hideSidebar: function () {
      NexT.utils.isDesktop() && $('body').velocity('stop').velocity({paddingRight: 0});
      this.sidebarEl.find('.motion-element').velocity('stop').css('display', 'none');
      this.sidebarEl.velocity('stop').velocity({width: 0}, {display: 'none'});

      sidebarToggleLines.init();

      this.sidebarEl.removeClass('sidebar-active');
      this.sidebarEl.trigger('sidebar.isHiding');

      // Prevent adding TOC to Overview if Overview was selected when close & open sidebar.
      if (!!$('.post-toc-wrap')) {
        if ($('.site-overview-wrap').css('display') === 'block') {
          $('.post-toc-wrap').removeClass('motion-element');
        } else {
          $('.post-toc-wrap').addClass('motion-element');
        }
      }
    }
  };
  sidebarToggleMotion.init();

  NexT.motion.integrator = {
    queue: [],
    cursor: -1,
    add: function (fn) {
      this.queue.push(fn);
      return this;
    },
    next: function () {
      this.cursor++;
      var fn = this.queue[this.cursor];
      $.isFunction(fn) && fn(NexT.motion.integrator);
    },
    bootstrap: function () {
      this.next();
    }
  };

  NexT.motion.middleWares =  {
    logo: function (integrator) {
      var sequence = [];
      var $brand = $('.brand');
      var $title = $('.site-title');
      var $subtitle = $('.site-subtitle');
      var $logoLineTop = $('.logo-line-before i');
      var $logoLineBottom = $('.logo-line-after i');

      $brand.size() > 0 && sequence.push({
        e: $brand,
        p: {opacity: 1},
        o: {duration: 200}
      });

      NexT.utils.isMist() && hasElement([$logoLineTop, $logoLineBottom]) &&
      sequence.push(
        getMistLineSettings($logoLineTop, '100%'),
        getMistLineSettings($logoLineBottom, '-100%')
      );

      hasElement($title) && sequence.push({
        e: $title,
        p: {opacity: 1, top: 0},
        o: { duration: 200 }
      });

      hasElement($subtitle) && sequence.push({
        e: $subtitle,
        p: {opacity: 1, top: 0},
        o: {duration: 200}
      });

      if (CONFIG.motion.async) {
        integrator.next();
      }

      if (sequence.length > 0) {
        sequence[sequence.length - 1].o.complete = function () {
          integrator.next();
        };
        $.Velocity.RunSequence(sequence);
      } else {
        integrator.next();
      }


      function getMistLineSettings (element, translateX) {
        return {
          e: $(element),
          p: {translateX: translateX},
          o: {
            duration: 500,
            sequenceQueue: false
          }
        };
      }

      /**
       * Check if $elements exist.
       * @param {jQuery|Array} $elements
       * @returns {boolean}
       */
      function hasElement ($elements) {
        $elements = Array.isArray($elements) ? $elements : [$elements];
        return $elements.every(function ($element) {
          return $.isFunction($element.size) && $element.size() > 0;
        });
      }
    },

    menu: function (integrator) {

      if (CONFIG.motion.async) {
        integrator.next();
      }

      $('.menu-item').velocity('transition.slideDownIn', {
        display: null,
        duration: 200,
        complete: function () {
          integrator.next();
        }
      });
    },

    postList: function (integrator) {
      //var $post = $('.post');
      var $postBlock = $('.post-block, .pagination, .comments');
      var $postBlockTransition = CONFIG.motion.transition.post_block;
      var $postHeader = $('.post-header');
      var $postHeaderTransition = CONFIG.motion.transition.post_header;
      var $postBody = $('.post-body');
      var $postBodyTransition = CONFIG.motion.transition.post_body;
      var $collHeader = $('.collection-title, .archive-year');
      var $collHeaderTransition = CONFIG.motion.transition.coll_header;
      var $sidebarAffix = $('.sidebar-inner');
      var $sidebarAffixTransition = CONFIG.motion.transition.sidebar;
      var hasPost = $postBlock.size() > 0;

      hasPost ? postMotion() : integrator.next();

      if (CONFIG.motion.async) {
        integrator.next();
      }

      function postMotion () {
        var postMotionOptions = window.postMotionOptions || {
          stagger: 100,
          drag: true
        };
        postMotionOptions.complete = function () {
          // After motion complete need to remove transform from sidebar to let affix work on Pisces | Gemini.
          if (CONFIG.motion.transition.sidebar && (NexT.utils.isPisces() || NexT.utils.isGemini())) {
            $sidebarAffix.css({ 'transform': 'initial' });
          }
          integrator.next();
        };

        //$post.velocity('transition.slideDownIn', postMotionOptions);
        if (CONFIG.motion.transition.post_block) {
          $postBlock.velocity('transition.' + $postBlockTransition, postMotionOptions);
        }
        if (CONFIG.motion.transition.post_header) {
          $postHeader.velocity('transition.' + $postHeaderTransition, postMotionOptions);
        }
        if (CONFIG.motion.transition.post_body) {
          $postBody.velocity('transition.' + $postBodyTransition, postMotionOptions);
        }
        if (CONFIG.motion.transition.coll_header) {
          $collHeader.velocity('transition.' + $collHeaderTransition, postMotionOptions);
        }
        // Only for Pisces | Gemini.
        if (CONFIG.motion.transition.sidebar && (NexT.utils.isPisces() || NexT.utils.isGemini())) {
          $sidebarAffix.velocity('transition.' + $sidebarAffixTransition, postMotionOptions);
        }
      }
    },

    sidebar: function (integrator) {
      if (CONFIG.sidebar.display === 'always') {
        NexT.utils.displaySidebar();
      }
      integrator.next();
    }
  };

}

/* ========================================================================
* Bootstrap: scrollspy.js v3.3.2
* http://getbootstrap.com/javascript/#scrollspy
* ========================================================================
* Copyright 2011-2015 Twitter, Inc.
* Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
* ======================================================================== */

/**
 * Custom by iissnan
 *
 * - Add a `clear.bs.scrollspy` event.
 * - Esacpe targets selector.
 */

function scrollspy_js() {
  +function ($) {
    'use strict';

    // SCROLLSPY CLASS DEFINITION
    // ==========================

    function ScrollSpy(element, options) {
      this.$body = $(document.body)
      this.$scrollElement = $(element).is(document.body) ? $(window) : $(element)
      this.options = $.extend({}, ScrollSpy.DEFAULTS, options)
      this.selector = (this.options.target || '') + ' .nav li > a'
      this.offsets = []
      this.targets = []
      this.activeTarget = null
      this.scrollHeight = 0

      this.$scrollElement.on('scroll.bs.scrollspy', $.proxy(this.process, this))
      this.refresh()
      this.process()
    }

    ScrollSpy.VERSION = '3.3.2'

    ScrollSpy.DEFAULTS = {
      offset: 10
    }

    ScrollSpy.prototype.getScrollHeight = function () {
      return this.$scrollElement[0].scrollHeight || Math.max(this.$body[0].scrollHeight, document.documentElement.scrollHeight)
    }

    ScrollSpy.prototype.refresh = function () {
      var that = this
      var offsetMethod = 'offset'
      var offsetBase = 0

      this.offsets = []
      this.targets = []
      this.scrollHeight = this.getScrollHeight()

      if (!$.isWindow(this.$scrollElement[0])) {
        offsetMethod = 'position'
        offsetBase = this.$scrollElement.scrollTop()
      }

      this.$body
        .find(this.selector)
        .map(function () {
          var $el = $(this)
          var href = $el.data('target') || $el.attr('href')
          var $href = /^#./.test(href) && $(NexT.utils.escapeSelector(href)) // Need to escape selector.

          return ($href
            && $href.length
            && $href.is(':visible')
            && [[$href[offsetMethod]().top + offsetBase, href]]) || null
        })
        .sort(function (a, b) {
          return a[0] - b[0]
        })
        .each(function () {
          that.offsets.push(this[0])
          that.targets.push(this[1])
        })


    }

    ScrollSpy.prototype.process = function () {
      var scrollTop = this.$scrollElement.scrollTop() + this.options.offset
      var scrollHeight = this.getScrollHeight()
      var maxScroll = this.options.offset + scrollHeight - this.$scrollElement.height()
      var offsets = this.offsets
      var targets = this.targets
      var activeTarget = this.activeTarget
      var i

      if (this.scrollHeight != scrollHeight) {
        this.refresh()
      }

      if (scrollTop >= maxScroll) {
        return activeTarget != (i = targets[targets.length - 1]) && this.activate(i)
      }

      if (activeTarget && scrollTop < offsets[0]) {
        $(this.selector).trigger('clear.bs.scrollspy')  // Add a custom event.
        this.activeTarget = null
        return this.clear()
      }

      for (i = offsets.length; i--;) {
        activeTarget != targets[i]
        && scrollTop >= offsets[i]
        && (!offsets[i + 1] || scrollTop <= offsets[i + 1])
        && this.activate(targets[i])
      }
    }

    ScrollSpy.prototype.activate = function (target) {
      this.activeTarget = target

      this.clear()

      var selector = this.selector +
        '[data-target="' + target + '"],' +
        this.selector + '[href="' + target + '"]'

      var active = $(selector)
        .parents('li')
        .addClass('active')

      if (active.parent('.dropdown-menu').length) {
        active = active
          .closest('li.dropdown')
          .addClass('active')
      }

      active.trigger('activate.bs.scrollspy')
    }

    ScrollSpy.prototype.clear = function () {
      $(this.selector)
        .parentsUntil(this.options.target, '.active')
        .removeClass('active')
    }


    // SCROLLSPY PLUGIN DEFINITION
    // ===========================

    function Plugin(option) {
      return this.each(function () {
        var $this = $(this)
        var data = $this.data('bs.scrollspy')
        var options = typeof option == 'object' && option

        if (!data) $this.data('bs.scrollspy', (data = new ScrollSpy(this, options)))
        if (typeof option == 'string') data[option]()
      })
    }

    var old = $.fn.scrollspy

    $.fn.scrollspy = Plugin
    $.fn.scrollspy.Constructor = ScrollSpy


    // SCROLLSPY NO CONFLICT
    // =====================

    $.fn.scrollspy.noConflict = function () {
      $.fn.scrollspy = old
      return this
    }


    // SCROLLSPY DATA-API
    // ==================

    $(window).on('load.bs.scrollspy.data-api', function () {
      $('[data-spy="scroll"]').each(function () {
        var $spy = $(this)
        Plugin.call($spy, $spy.data())
      })
    })

  }(jQuery);
}
/* global NexT: true */

function postdetails_js () {

  initScrollSpy();

  function initScrollSpy () {
    var tocSelector = '.post-toc';
    var $tocElement = $(tocSelector);
    var activeCurrentSelector = '.active-current';

    $tocElement
      .on('activate.bs.scrollspy', function () {
        var $currentActiveElement = $(tocSelector + ' .active').last();

        removeCurrentActiveClass();
        $currentActiveElement.addClass('active-current');

        // Scrolling to center active TOC element if TOC content is taller then viewport.
        $tocElement.scrollTop($currentActiveElement.offset().top - $tocElement.offset().top + $tocElement.scrollTop() - ($tocElement.height() / 2));
      })
      .on('clear.bs.scrollspy', removeCurrentActiveClass);

    $('body').scrollspy({ target: tocSelector });

    function removeCurrentActiveClass () {
      $(tocSelector + ' ' + activeCurrentSelector)
        .removeClass(activeCurrentSelector.substring(1));
    }
  }


  var html = $('html');
  var TAB_ANIMATE_DURATION = 200;
  var hasVelocity = $.isFunction(html.velocity);

  $('.sidebar-nav li').on('click', function () {
    var item = $(this);
    var activeTabClassName = 'sidebar-nav-active';
    var activePanelClassName = 'sidebar-panel-active';
    if (item.hasClass(activeTabClassName)) {
      return;
    }

    var currentTarget = $('.' + activePanelClassName);
    var target = $('.' + item.data('target'));

    hasVelocity ?
      currentTarget.velocity('transition.slideUpOut', TAB_ANIMATE_DURATION, function () {
        target
          .velocity('stop')
          .velocity('transition.slideDownIn', TAB_ANIMATE_DURATION)
          .addClass(activePanelClassName);
      }) :
      currentTarget.animate({ opacity: 0 }, TAB_ANIMATE_DURATION, function () {
        currentTarget.hide();
        target
          .stop()
          .css({'opacity': 0, 'display': 'block'})
          .animate({ opacity: 1 }, TAB_ANIMATE_DURATION, function () {
            currentTarget.removeClass(activePanelClassName);
            target.addClass(activePanelClassName);
          });
      });

    item.siblings().removeClass(activeTabClassName);
    item.addClass(activeTabClassName);
  });

  // TOC item animation navigate & prevent #item selector in adress bar.
  $('.post-toc a').on('click', function (e) {
    e.preventDefault();
    var targetSelector = NexT.utils.escapeSelector(this.getAttribute('href'));
    var offset = $(targetSelector).offset().top;

    hasVelocity ?
      html.velocity('stop').velocity('scroll', {
        offset: offset  + 'px',
        mobileHA: false
      }) :
      $('html, body').stop().animate({
        scrollTop: offset
      }, 500);
  });
  //是否是mobile的函数
  function isMobile() {
    var userAgentInfo = navigator.userAgent;

    var mobileAgents = [ "Android", "iPhone", "SymbianOS", "Windows Phone", "iPad","iPod"];

    var mobile_flag = false;

    //根据userAgent判断是否是手机
    for (var v = 0; v < mobileAgents.length; v++) {
      if (userAgentInfo.indexOf(mobileAgents[v]) > 0) {
        mobile_flag = true;
        break;
      }
    }

    var screen_width = window.screen.width;
    var screen_height = window.screen.height;

    //根据屏幕分辨率判断是否是手机
    if(screen_width < 500 && screen_height < 800){
      mobile_flag = true;
    }

    return mobile_flag;
  }
  /*
  下面这段代码是关于右边的sidebar的js的核心包括：
    自动隐藏，自动显示，点击出现，点击隐藏，回到首页，回到中间等操作*/
  // Expand sidebar on post detail page by default, when post has a toc.
  //判断是否是移动端
  var isMobile = isMobile();
  var $tocContent = $('.post-toc-content');
  var isSidebarCouldDisplay = CONFIG.sidebar.display === 'post' ||
    CONFIG.sidebar.display === 'always';
  var hasTOC = $tocContent.length > 0 && $tocContent.html().trim().length > 0;
  if (isSidebarCouldDisplay && hasTOC&& !isMobile) {
    NexT.utils.displaySidebar();
  }else {
    /*判断this.sidebarEl是否为null，因为从首页进入留言板的时候并没有this.sidebarEl这个属性，回报类似于空指针的异常。
     下面这个空指针的判断暂时注释掉因为，如果打开的，返回到首页的时候并没有this.sidebarEl，
    下面的代码不会进行，下面的，文章在左面没回去的bug就无法得到解决。*/
    /*已经将空指针异常的判断打开，因为下面的源码是this.sidebar，这里的this可能并不是element，所以会导致未定义，其实在element中是定义了的
    * 在这里将this去掉就解决了*/
    /*
    * 下面这段源码在motion.js中的hideSidebar方法。*/
    var sidebarEl=$('.sidebar')
    if (typeof(sidebarEl)!=  "undefined") {
      NexT.utils.isDesktop() && $('body').velocity('stop').velocity({paddingRight: 0});
      sidebarEl.find('.motion-element').velocity('stop').css('display', 'none');
      sidebarEl.velocity('stop').velocity({width: 0}, {display: 'none'});
      /*sidebarToggleLines是在motion js里面的，在这里回报错，在下面进行了引用*/
      sidebarToggleLines.init();
      sidebarEl.removeClass('sidebar-active');
      sidebarEl.trigger('sidebar.isHiding');
      // Prevent adding TOC to Overview if Overview was selected when close & open sidebar.
      /*下面的else的js是我自己加的因为，点击有目录的文章后右侧sidebar会自动出来，文章会自动往左面走，因为margin是0 auto的。这个时候点击主页，
      文章还是在左面的没有回去，为了解决这个bug*/
      if (!!$('.post-toc-wrap')) {
        if ($('.site-overview-wrap').css('display') === 'block') {
          $('.post-toc-wrap').removeClass('motion-element');
        } else {
          $('.post-toc-wrap').addClass('motion-element');
        }
      }
    }

  }
}


var sidebarToggleLines = {
  lines: [],
  push: function (line) {
    this.lines.push(line);
  },
  init: function () {
    this.lines.forEach(function (line) {
      line.init();
    });
  },
  arrow: function () {
    this.lines.forEach(function (line) {
      line.arrow();
    });
  },
  close: function () {
    this.lines.forEach(function (line) {
      line.close();
    });
  }
};


function lean_analytics() {
  /*里面的参数原来是{{}}，可能会出现问题，所以在这里我直接将appid和key粘贴过来，具体问题是什么不详*/
  AV.initialize("6og9b7lpddMqazBCDe8z4HqL-gzGzoHsz", "faKN7dalSdXLmYYJTRq98B1f");
  $.getScript("https://cdn1.lncld.net/static/js/av-core-mini-0.6.4.js");
  function showTime(Counter) {
    var query = new AV.Query(Counter);
    var entries = [];
    var $visitors = $(".leancloud_visitors");

    $visitors.each(function () {
      entries.push( $(this).attr("id").trim() );
    });

    query.containedIn('url', entries);
    query.find()
      .done(function (results) {
        var COUNT_CONTAINER_REF = '.leancloud-visitors-count';

        if (results.length === 0) {
          $visitors.find(COUNT_CONTAINER_REF).text(0);
          return;
        }

        for (var i = 0; i < results.length; i++) {
          var item = results[i];
          var url = item.get('url');
          var time = item.get('time');
          var element = document.getElementById(url);

          $(element).find(COUNT_CONTAINER_REF).text(time);
        }
        for(var i = 0; i < entries.length; i++) {
          var url = entries[i];
          var element = document.getElementById(url);
          var countSpan = $(element).find(COUNT_CONTAINER_REF);
          if( countSpan.text() == '') {
            countSpan.text(0);
          }
        }
      })
      .fail(function (object, error) {
        console.log("Error: " + error.code + " " + error.message);
      });
  }

  function addCount(Counter) {
    var $visitors = $(".leancloud_visitors");
    var url = $visitors.attr('id').trim();
    var title = $visitors.attr('data-flag-title').trim();
    var query = new AV.Query(Counter);

    query.equalTo("url", url);
    query.find({
      success: function(results) {
        if (results.length > 0) {
          var counter = results[0];
          counter.fetchWhenSave(true);
          counter.increment("time");
          counter.save(null, {
            success: function(counter) {
              var $element = $(document.getElementById(url));
              $element.find('.leancloud-visitors-count').text(counter.get('time'));
            },
            error: function(counter, error) {
              console.log('Failed to save Visitor num, with error message: ' + error.message);
            }
          });
        } else {
          var newcounter = new Counter();
          /* Set ACL */
          var acl = new AV.ACL();
          acl.setPublicReadAccess(true);
          acl.setPublicWriteAccess(true);
          newcounter.setACL(acl);
          /* End Set ACL */
          newcounter.set("title", title);
          newcounter.set("url", url);
          newcounter.set("time", 1);
          newcounter.save(null, {
            success: function(newcounter) {
              var $element = $(document.getElementById(url));
              $element.find('.leancloud-visitors-count').text(newcounter.get('time'));
            },
            error: function(newcounter, error) {
              console.log('Failed to create');
            }
          });
        }
      },
      error: function(error) {
        console.log('Error:' + error.code + " " + error.message);
      }
    });
  }


  var Counter = AV.Object.extend("Counter");
  if ($('.leancloud_visitors').length == 1) {
    addCount(Counter);
  } else if ($('.post-title-link').length > 1) {
    showTime(Counter);
  }

}

function baidutuisong() {
  var bp = document.createElement('script');
  var curProtocol = window.location.protocol.split(':')[0];
  if (curProtocol === 'https') {
    bp.src = 'https://zz.bdstatic.com/linksubmit/push.js';
  }
  else {
    bp.src = 'http://push.zhanzhang.baidu.com/push.js';
  }
  var s = document.getElementsByTagName("script")[0];
  s.parentNode.insertBefore(bp, s);

}

// define(['jquery.share.min'],function () {
var $config = {
  sites : ['weibo','qq', 'wechat','qzone','douban', 'facebook',  'google','twitter'],
  disabled: [ 'linkedin', 'diandian'],
  wechatQrcodeTitle: "微信扫一扫",
  wechatQrcodeHelper: '<p>微信扫一扫，右上角分享</p>',
  source: 'Leesin Dong'
};


$('.post-spread').share($config);

function pjaxshare() {
  $('.post-spread').share($config);
}
// })

/* global NexT: true */
function utils_js() {
  NexT.utils = NexT.$u = {
    /**
     * Wrap images with fancybox support.
     */
    wrapImageWithFancyBox: function () {
      $('.content img')
        .not('[hidden]')
        .not('.group-picture img, .post-gallery img')
        .each(function () {
          var $image = $(this);
          var imageTitle = $image.attr('title');
          var $imageWrapLink = $image.parent('a');

          if ($imageWrapLink.size() < 1) {
            var imageLink = ($image.attr('data-original')) ? this.getAttribute('data-original') : this.getAttribute('src');
            $imageWrapLink = $image.wrap('<a href="' + imageLink + '"></a>').parent('a');
          }

          $imageWrapLink.addClass('fancybox fancybox.image');
          $imageWrapLink.attr('rel', 'group');

          if (imageTitle) {
            $imageWrapLink.append('<p class="image-caption">' + imageTitle + '</p>');

            //make sure img title tag will show correctly in fancybox
            $imageWrapLink.attr('title', imageTitle);
          }
        });

      $('.fancybox').fancybox({
        helpers: {
          overlay: {
            locked: false
          }
        }
      });
    },

    lazyLoadPostsImages: function () {
      $('#posts').find('img').lazyload({
        //placeholder: '/images/loading.gif',
        effect: 'fadeIn',
        threshold: 0
      });
    },

    /**
     * Tabs tag listener (without twitter bootstrap).
     */
    registerTabsTag: function () {
      var tNav = '.tabs ul.nav-tabs ';

      // Binding `nav-tabs` & `tab-content` by real time permalink changing.
      $(function () {
        $(window).bind('hashchange', function () {
          var tHash = location.hash;
          if (tHash !== '') {
            $(tNav + 'li:has(a[href="' + tHash + '"])').addClass('active').siblings().removeClass('active');
            $(tHash).addClass('active').siblings().removeClass('active');
          }
        }).trigger('hashchange');
      });

      $(tNav + '.tab').on('click', function (href) {
        href.preventDefault();
        // Prevent selected tab to select again.
        if (!$(this).hasClass('active')) {

          // Add & Remove active class on `nav-tabs` & `tab-content`.
          $(this).addClass('active').siblings().removeClass('active');
          var tActive = $(this).find('a').attr('href');
          $(tActive).addClass('active').siblings().removeClass('active');

          // Clear location hash in browser if #permalink exists.
          if (location.hash !== '') {
            history.pushState('', document.title, window.location.pathname + window.location.search);
          }
        }
      });

    },

    registerESCKeyEvent: function () {
      $(document).on('keyup', function (event) {
        var shouldDismissSearchPopup = event.which === 27 &&
          $('.search-popup').is(':visible');
        if (shouldDismissSearchPopup) {
          $('.search-popup').hide();
          $('.search-popup-overlay').remove();
          $('body').css('overflow', '');
        }
      });
    },

    registerBackToTop: function () {
      var THRESHOLD = 50;
      var $top = $('.back-to-top');

      $(window).on('scroll', function () {
        $top.toggleClass('back-to-top-on', window.pageYOffset > THRESHOLD);

        var scrollTop = $(window).scrollTop();
        var contentVisibilityHeight = NexT.utils.getContentVisibilityHeight();
        var scrollPercent = (scrollTop) / (contentVisibilityHeight);
        var scrollPercentRounded = Math.round(scrollPercent * 100);
        var scrollPercentMaxed = (scrollPercentRounded > 100) ? 100 : scrollPercentRounded;
        $('#scrollpercent>span').html(scrollPercentMaxed);
      });

      $top.on('click', function () {
        $('body').velocity('scroll');
      });
    },

    /**
     * Transform embedded video to support responsive layout.
     * @see http://toddmotto.com/fluid-and-responsive-youtube-and-vimeo-videos-with-fluidvids-js/
     */
    embeddedVideoTransformer: function () {
      var $iframes = $('iframe');

      // Supported Players. Extend this if you need more players.
      var SUPPORTED_PLAYERS = [
        'www.youtube.com',
        'player.vimeo.com',
        'player.youku.com',
        'music.163.com',
        'www.tudou.com'
      ];
      var pattern = new RegExp(SUPPORTED_PLAYERS.join('|'));

      $iframes.each(function () {
        var iframe = this;
        var $iframe = $(this);
        var oldDimension = getDimension($iframe);
        var newDimension;

        if (this.src.search(pattern) > 0) {

          // Calculate the video ratio based on the iframe's w/h dimensions
          var videoRatio = getAspectRadio(oldDimension.width, oldDimension.height);

          // Replace the iframe's dimensions and position the iframe absolute
          // This is the trick to emulate the video ratio
          $iframe.width('100%').height('100%')
            .css({
              position: 'absolute',
              top: '0',
              left: '0'
            });


          // Wrap the iframe in a new <div> which uses a dynamically fetched padding-top property
          // based on the video's w/h dimensions
          var wrap = document.createElement('div');
          wrap.className = 'fluid-vids';
          wrap.style.position = 'relative';
          wrap.style.marginBottom = '20px';
          wrap.style.width = '100%';
          wrap.style.paddingTop = videoRatio + '%';
          // Fix for appear inside tabs tag.
          (wrap.style.paddingTop === '') && (wrap.style.paddingTop = '50%');

          // Add the iframe inside our newly created <div>
          var iframeParent = iframe.parentNode;
          iframeParent.insertBefore(wrap, iframe);
          wrap.appendChild(iframe);

          // Additional adjustments for 163 Music
          if (this.src.search('music.163.com') > 0) {
            newDimension = getDimension($iframe);
            var shouldRecalculateAspect = newDimension.width > oldDimension.width ||
              newDimension.height < oldDimension.height;

            // 163 Music Player has a fixed height, so we need to reset the aspect radio
            if (shouldRecalculateAspect) {
              wrap.style.paddingTop = getAspectRadio(newDimension.width, oldDimension.height) + '%';
            }
          }
        }
      });

      function getDimension($element) {
        return {
          width: $element.width(),
          height: $element.height()
        };
      }

      function getAspectRadio(width, height) {
        return height / width * 100;
      }
    },

    /**
     * Add `menu-item-active` class name to menu item
     * via comparing location.path with menu item's href.
     */
    addActiveClassToMenuItem: function () {
      var path = window.location.pathname;
      path = path === '/' ? path : path.substring(0, path.length - 1);
      $('.menu-item a[href^="' + path + '"]:first').parent().addClass('menu-item-active');
    },

    hasMobileUA: function () {
      var nav = window.navigator;
      var ua = nav.userAgent;
      var pa = /iPad|iPhone|Android|Opera Mini|BlackBerry|webOS|UCWEB|Blazer|PSP|IEMobile|Symbian/g;

      return pa.test(ua);
    },

    isTablet: function () {
      return window.screen.width < 992 && window.screen.width > 767 && this.hasMobileUA();
    },

    isMobile: function () {
      return window.screen.width < 767 && this.hasMobileUA();
    },

    isDesktop: function () {
      return !this.isTablet() && !this.isMobile();
    },

    /**
     * Escape meta symbols in jQuery selectors.
     *
     * @param selector
     * @returns {string|void|XML|*}
     */
    escapeSelector: function (selector) {
      return selector.replace(/[!"$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, '\\$&');
    },

    displaySidebar: function () {
      if (!this.isDesktop() || this.isPisces() || this.isGemini()) {
        return;
      }
      $('.sidebar-toggle').trigger('click');
    },

    isMist: function () {
      return CONFIG.scheme === 'Mist';
    },

    isPisces: function () {
      return CONFIG.scheme === 'Pisces';
    },

    isGemini: function () {
      return CONFIG.scheme === 'Gemini';
    },

    getScrollbarWidth: function () {
      var $div = $('<div />').addClass('scrollbar-measure').prependTo('body');
      var div = $div[0];
      var scrollbarWidth = div.offsetWidth - div.clientWidth;

      $div.remove();

      return scrollbarWidth;
    },

    getContentVisibilityHeight: function () {
      var docHeight = $('#content').height(),
        winHeight = $(window).height(),
        contentVisibilityHeight = (docHeight > winHeight) ? (docHeight - winHeight) : ($(document).height() - winHeight);
      return contentVisibilityHeight;
    },

    getSidebarb2tHeight: function () {
      //var sidebarb2tHeight = (CONFIG.sidebar.b2t) ? document.getElementsByClassName('back-to-top')[0].clientHeight : 0;
      var sidebarb2tHeight = (CONFIG.sidebar.b2t) ? $('.back-to-top').height() : 0;
      //var sidebarb2tHeight = (CONFIG.sidebar.b2t) ? 24 : 0;
      return sidebarb2tHeight;
    },

    getSidebarSchemePadding: function () {
      var sidebarNavHeight = ($('.sidebar-nav').css('display') == 'block') ? $('.sidebar-nav').outerHeight(true) : 0,
        sidebarInner = $('.sidebar-inner'),
        sidebarPadding = sidebarInner.innerWidth() - sidebarInner.width(),
        sidebarSchemePadding = this.isPisces() || this.isGemini() ?
          ((sidebarPadding * 2) + sidebarNavHeight + (CONFIG.sidebar.offset * 2) + this.getSidebarb2tHeight()) :
          ((sidebarPadding * 2) + (sidebarNavHeight / 2));
      return sidebarSchemePadding;
    }

    /**
     * Affix behaviour for Sidebar.
     *
     * @returns {Boolean}
     */
//  needAffix: function () {
//    return this.isPisces() || this.isGemini();
//  }
  };
}


initSidebarDimension();

/**
 * Init Sidebar & TOC inner dimensions on all pages and for all schemes.
 * Need for Sidebar/TOC inner scrolling if content taller then viewport.
 */
function initSidebarDimension () {
  var updateSidebarHeightTimer;

  $(window).on('resize', function () {
    updateSidebarHeightTimer && clearTimeout(updateSidebarHeightTimer);

    updateSidebarHeightTimer = setTimeout(function () {
      var sidebarWrapperHeight = document.body.clientHeight - NexT.utils.getSidebarSchemePadding();

      updateSidebarHeight(sidebarWrapperHeight);
    }, 0);
  });

  // Initialize Sidebar & TOC Width.
  var scrollbarWidth = NexT.utils.getScrollbarWidth();
  if ($('.site-overview-wrap').height() > (document.body.clientHeight - NexT.utils.getSidebarSchemePadding())) {
    $('.site-overview').css('width', 'calc(100% + ' + scrollbarWidth + 'px)');
  }
  if ($('.post-toc-wrap').height() > (document.body.clientHeight - NexT.utils.getSidebarSchemePadding())) {
    $('.post-toc').css('width', 'calc(100% + ' + scrollbarWidth + 'px)');
  }

  // Initialize Sidebar & TOC Height.
  updateSidebarHeight(document.body.clientHeight - NexT.utils.getSidebarSchemePadding());
}

function updateSidebarHeight (height) {
  height = height || 'auto';
  $('.site-overview, .post-toc').css('max-height', height);
}

function initSidebarDimension () {
  var updateSidebarHeightTimer;

  $(window).on('resize', function () {
    updateSidebarHeightTimer && clearTimeout(updateSidebarHeightTimer);

    updateSidebarHeightTimer = setTimeout(function () {
      var sidebarWrapperHeight = document.body.clientHeight - NexT.utils.getSidebarSchemePadding();

      updateSidebarHeight(sidebarWrapperHeight);
    }, 0);
  });

  // Initialize Sidebar & TOC Width.
  var scrollbarWidth = NexT.utils.getScrollbarWidth();
  if ($('.site-overview-wrap').height() > (document.body.clientHeight - NexT.utils.getSidebarSchemePadding())) {
    $('.site-overview').css('width', 'calc(100% + ' + scrollbarWidth + 'px)');
  }
  if ($('.post-toc-wrap').height() > (document.body.clientHeight - NexT.utils.getSidebarSchemePadding())) {
    $('.post-toc').css('width', 'calc(100% + ' + scrollbarWidth + 'px)');
  }

  // Initialize Sidebar & TOC Height.
  updateSidebarHeight(document.body.clientHeight - NexT.utils.getSidebarSchemePadding());
}

function lazyLoad() {
  $('img').lazyload({
    placeholder: '/images/loading.gif',
    effect: 'fadeIn',
    threshold : 100,
    failure_limit : 20,
    skip_invisible : false
  });
}

//来必力评论系统
function comments_js() {
 if ($('.comments').length>0){
   $.getScript("https://cdn-city.livere.com/js/embed.dist.js");
 }
}
//不蒜子js
function busuanzi_js(){
  // $.getScript("https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js");
  $.getScript("/js/src/pjax/busuanzi.js");
}

//gitalk评论
function gitalk() {
  if ($('#gitalk-container').length>0) {

    var gitalk = new Gitalk({

      // gitalk的主要参数
      clientID: 'a9ce619db1631dda096d',
      clientSecret: '7e8f7305d2493c153d210082610329f07f1aa093',
      repo: 'dataiyangu.github.io',
      owner: 'dataiyangu',
      admin: ['dataiyangu'],
      id: location.pathname

    });
    gitalk.render('gitalk-container');
  }

}
//护眼
function eye_js() {
  $color = $("#canvas").css("background");
  $("article").css("background", $color);
  // $("#sidebar").css("background",$color);
  // $("#header_left").css("background",$color);
  var color = $color
  // console.log(color)
  if (color.indexOf("rgb(50, 50, 50)") >= 0) {
    $("p").css({"color": "#999"})
    $("a").css({"color": "#FF99CC"})
    $("h1 a").css({"color": "#FFFF66"})
    $("h2 a").css({"color": "#FFFF66"});
    $("h3 a").css({"color": "#FFFF66"});
    $("h4 a").css({"color": "#FFFF66"});
    $("h1").css({"color": "#FFFF66"})
    $("h2").css({"color": "#FFFF66"});
    $("h3").css({"color": "#FFFF66"});
    $("h4").css({"color": "#FFFF66"});
  } else {
    $("article p").css({"color": "#333"});
    //其他的就不设置了影响了常驻顶部的
    // $("a:not(.social-share-icon)").css({"color": "#fff"});
    $("p a").css({"color":"#0593d3"});
    $("h1").css({"color": "#555"});
    $("h1").css({"color": "#555"});
    $("h2").css({"color": "#555"});
    $("h3").css({"color": "#555"});
    $(".sidebar a ").css({"color": "#999"});
    $(".header_left a ").css({"color": "#999"});

  }
}
//转到文章实现滚动效果
function article_top_js() {
  function top(){
    // console.log(window.location.pathname)
    var pathname = window.location.pathname
    var total = $(".header").innerHeight();
    if (pathname.indexOf("html")>0) {

      $("html,body").animate({scrollTop:total},300)
    }
  }
  setTimeout(top,800);

}

function donate() {
  var n = $("#QR")
  var e = $("#rewardButton")
  if (e.length > 0) {
    e.click(
      function () {
        n.css("display") == "none" ? n.css("display", "block") : n.css("display", "none")
      }
    )
  }
}

//实现文章给你随鼠标滚动动态出现的动画
//原来的代码就是将   my_scrollreveal和scrollReveal.js放到了一个方法中，这里暂时去掉这个功能。

//隐藏左下角的小东东
function hover_left_bottom(){
  // 为了将左侧的小乖乖们自动隐藏出现

  function outArticle() {
    $(".eye").animate({left: 0},
      {duration:500, easing:"easeOutBounce",complete:function () {
        }}
    );

    // $(".eye").css("left",0)
    $(".header_left").animate({left: 0},
      {duration:500, easing:"easeOutBounce",complete:function () {
        }}
    );
    // $(".header_left").css("left",0)

    $(".aplayer-body").animate({left: "-66px"},
      {duration:80, easing:"easeOutBounce",complete:function () {
        }}
    );
    // $(".aplayer-body").css("left","-66px")
  }


  function inArticle(){
    $(".eye").animate({left: "-18px"},
      {duration:500, easing:"easeOutBounce",complete:function () {
        }}
    );

    // $(".eye").css("left","-18px")

    $(".header_left").animate({left: "-18px"},
      {duration:500, easing:"easeOutBounce",complete:function () {
        }}
    );
    // $(".header_left").css("left","-18px")
    if (($(".header_left").css("width")).indexOf("80")!= -1) {
      $(".header_sidebar").click()
    }
    if ($(".eye1").css("display")=="block"){
      $(".eye2").click()
    }
    if ($(".aplayer-body").css("left").indexOf("-84") == -1 | $(".aplayer-body").css("left").indexOf("-66") == -1){
      if ($(".aplayer-narrow").length!=1){
        $(".aplayer-miniswitcher").click()

        $(".aplayer-body").animate({left: "-84px"},
          {duration:80, easing:"easeOutBounce",complete:function () {
            }}
        );
        // $(".aplayer-body").css("left","-84px")
      }
    }
      $(".aplayer-body").animate({left: "-84px"},
        {duration:80, easing:"easeOutBounce",complete:function () {
          }}
      );
      // $(".aplayer-body").css("left","-84px")
    }



  function hover_sidebar() {
    var out_id = 0;
    $( ".hover_sidebar" ).hover( function() {
      out_id = setTimeout( function() {
        //当触发hover就开始自动在1秒后执行相应代码
        outArticle()

      }, 1000 );
    }, function() {
      clearTimeout( out_id );//当在1秒内退出了hover事件就取消计时代码

    } );


    var in_id = 0;
    $( "#posts").hover( function() {
      in_id = setTimeout( function() {
        //当触发hover就开始自动在1秒后执行相应代码


        inArticle()

      }, 1000 );
    }, function() {
      clearTimeout( in_id );//当在1秒内退出了hover事件就取消计时代码
    } );

  }


  hover_sidebar()
  $(function () {
    setTimeout(inArticle,2000)
  });


}
//pjax后点击护眼色，还是需要初始化一次的，因为背景色的改变再初始化的函数里面
function pjax_eye_change() {
  $(".eye ul li").click(function () {
    my_scrollReveal_js();
  })
}


//图片点击后不放大
function wrapImageWithFancyBox() {
  $('.content img')
    .not('[hidden]')
    .not('.group-picture img, .post-gallery img')
    .each(function () {
      var $image = $(this);
      var imageTitle = $image.attr('title');
      var $imageWrapLink = $image.parent('a');

      if ($imageWrapLink.size() < 1) {
        var imageLink = ($image.attr('data-original')) ? this.getAttribute('data-original') : this.getAttribute('src');
        $imageWrapLink = $image.wrap('<a href="' + imageLink + '"></a>').parent('a');
      }

      $imageWrapLink.addClass('fancybox fancybox.image');
      $imageWrapLink.attr('rel', 'group');

      if (imageTitle) {
        $imageWrapLink.append('<p class="image-caption">' + imageTitle + '</p>');

        //make sure img title tag will show correctly in fancybox
        $imageWrapLink.attr('title', imageTitle);
      }
    });

  $('.fancybox').fancybox({
    helpers: {
      overlay: {
        locked: false
      }
    }
  });
}


//复制js
function copy_code(){
  $('.highlight').each(function (i, e) {
    var $wrap = $('<div>').addClass('highlight-wrap')
    $(e).after($wrap)
    $wrap.append($('<button>').addClass('copy-btn').append('复制').on('click', function (e) {
      var code = $(this).parent().find('.code').find('.line').map(function (i, e) {
        return $(e).text()
      }).toArray().join('\n')
      var ta = document.createElement('textarea')
      document.body.appendChild(ta)
      ta.style.position = 'absolute'
      ta.style.top = '0px'
      ta.style.left = '0px'
      ta.value = code
      ta.select()
      ta.focus()
      var result = document.execCommand('copy')
      document.body.removeChild(ta)
      if(result)$(this).text('复制成功')
      else $(this).text('复制失败')

      $(this).blur()
    })).on('mouseleave', function (e) {
      var $b = $(this).find('.copy-btn')
      setTimeout(function () {
        $b.text('复制')
      }, 300)
    }).append(e)
  })
}

//顶部常驻
function header_top(){
  $(function () {
    var oTop1 = $(document).scrollTop();
    function handleScroll() {
      //进行滚动时的相关处理
      var oTop2 = $(document).scrollTop();
      if (oTop2 > oTop1 ){
        //向下滑动隐藏
        $(".header_nav").css("background-color", "");
        $(".header_nav").stop().animate({top: "-50px"}, 200);
        $(".a_tag").stop().animate({top: "-50px"}, 200);
        // $(".header_nav").slideUp(300);
        // $(".a_tag").slideUp(300);
        $(".a_tag a").css("color", "#fff");
      } else if (oTop2<=2) {
        //滑到了顶部
        // $(".header_nav").css("opacity","0");
        $(".a_tag a").css("color","#fff");
        $(".header_nav").stop().animate({"opacity":'0'},200);
      } else {
        //向上滑动出现
        $(".header_nav").css("background-color","# ");
        $(".header_nav").stop().animate({top:'0px'},200);
        $(".a_tag").stop().animate({top:'0px'},200);
        // $(".header_nav").slideDown(300);
        // $(".a_tag").slideDown(300);
        $(".header_nav").css("opacity","0.9");
        $(".a_tag a").css("color","#666");

      }
      oTop1 = $(document).scrollTop();
    }

    var throttled = _.throttle(handleScroll, 100);
    $(window).scroll(throttled);
  });


}
