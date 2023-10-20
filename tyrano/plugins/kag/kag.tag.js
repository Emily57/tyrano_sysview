tyrano.plugin.kag.ftag = {
  tyrano: null,
  kag: null,
  array_tag: [],
  master_tag: {},
  current_order_index: -1,
  init: function () {
    for (var order_type in tyrano.plugin.kag.tag) {
      this.master_tag[order_type] = object(tyrano.plugin.kag.tag[order_type]);
      this.master_tag[order_type].kag = this.kag;
    }
  },
  buildTag: function (array_tag, label_name) {
    this.array_tag = array_tag;
    label_name
      ? this.nextOrderWithLabel(label_name)
      : this.nextOrderWithLabel("");
  },
  buildTagIndex: function (array_tag, index, auto_next) {
    this.array_tag = array_tag;
    this.nextOrderWithIndex(index, void 0, void 0, void 0, auto_next);
  },
  completeTrans: function () {
    this.kag.stat.is_trans = !1;
    if (1 == this.kag.stat.is_stop) {
      this.kag.layer.showEventLayer();
      this.nextOrder();
    }
  },
  hideNextImg: function () {
    $(".img_next").remove();
    $(".glyph_image").hide();
  },
  showNextImg: function () {
    if ("false" == this.kag.stat.flag_glyph) {
      $(".img_next").remove();
      this.kag.getMessageInnerLayer().find("p").append("");
    } else $(".glyph_image").show();
  },
  nextOrder: function () {
    this.kag.layer.layer_event.hide();
    if (1 == this.kag.stat.is_strong_stop) return !1;
    if (1 == this.kag.stat.is_adding_text) return !1;
    this.current_order_index++;
    if (this.array_tag.length <= this.current_order_index) {
      this.kag.endStorage();
      return !1;
    }
    var tag = $.cloneObject(this.array_tag[this.current_order_index]);
    this.kag.stat.current_line = tag.line;
    if (this.kag.is_rider) {
      tag.ks_file = this.kag.stat.current_scenario;
      this.kag.rider.pushConsoleLog(tag);
    } else if (this.kag.is_studio) {
      tag.ks_file = this.kag.stat.current_scenario;
      this.kag.studio.pushConsole(tag);
      this.kag.log("**:" + this.current_order_index + "　line:" + tag.line);
      this.kag.log(tag);
    } else {
      this.kag.log("**:" + this.current_order_index + "　line:" + tag.line);
      this.kag.log(tag);
    }
    if (
      ("call" == tag.name && "make.ks" == tag.pm.storage) ||
      "make.ks" == this.kag.stat.current_scenario
    ) {
      if (1 == this.kag.stat.flag_ref_page) {
        this.kag.tmp.loading_make_ref = !0;
        this.kag.stat.flag_ref_page = !1;
      }
    } else if (1 == this.kag.stat.flag_ref_page) {
      this.kag.stat.flag_ref_page = !1;
      this.kag.stat.log_clear = !0;
      this.kag.ftag.hideNextImg();
      this.kag.stat.vchat.is_active
        ? this.kag.ftag.startTag("vchat_in", {})
        : this.kag.getMessageInnerLayer().html("");
    }
    if (1 == this.checkCond(tag)) {
      if (1 == this.kag.stat.is_hide_message) {
        this.kag.layer.showMessageLayers();
        this.kag.stat.is_hide_message = !1;
      }
      if (this.master_tag[tag.name]) {
        tag.pm = this.convertEntity(tag.pm);
        var err_str = this.checkVital(tag);
        this.master_tag[tag.name].log_join
          ? (this.kag.stat.log_join = "true")
          : "text" == tag.name || (this.kag.stat.log_join = "false");
        this.checkCw(tag) && this.kag.layer.layer_event.show();
        if ("" != err_str) this.kag.error(err_str);
        else {
          tag.pm._tag = tag.name;
          this.master_tag[tag.name].start(
            $.extend(!0, $.cloneObject(this.master_tag[tag.name].pm), tag.pm)
          );
        }
      } else if (this.kag.stat.map_macro[tag.name]) {
        tag.pm = this.convertEntity(tag.pm);
        var pms = tag.pm,
          map_obj = this.kag.stat.map_macro[tag.name],
          back_pm = {};
        back_pm.index = this.kag.ftag.current_order_index;
        back_pm.storage = this.kag.stat.current_scenario;
        back_pm.pm = pms;
        this.kag.stat.mp = pms;
        this.kag.pushStack("macro", back_pm);
        this.kag.ftag.nextOrderWithIndex(map_obj.index, map_obj.storage);
      } else {
        $.error_message(
          $.lang("tag") + "：[" + tag.name + "]" + $.lang("not_exists")
        );
        this.nextOrder();
      }
    } else this.nextOrder();
  },
  checkCw: function (tag) {
    return (
      !!this.master_tag[tag.name].cw &&
      1 != this.kag.stat.is_script &&
      1 != this.kag.stat.is_html &&
      1 != this.kag.stat.checking_macro
    );
  },
  nextOrderWithTag: function (target_tags) {
    try {
      this.current_order_index++;
      var tag = this.array_tag[this.current_order_index];
      this.checkCond(tag);
      if ("" == target_tags[tag.name]) {
        if (this.master_tag[tag.name]) {
          switch (tag.name) {
            case "elsif":
            case "else":
            case "endif":
              var root = this.kag.getStack("if");
              if (!root || tag.pm.deep_if != root.deep) return !1;
          }
          tag.pm = this.convertEntity(tag.pm);
          tag.pm._tag = tag.name;
          this.master_tag[tag.name].start(
            $.extend(!0, $.cloneObject(this.master_tag[tag.name].pm), tag.pm)
          );
          return !0;
        }
        return !1;
      }
      return !1;
    } catch (e) {
      console.log(e);
      return !1;
    }
  },
  convertEntity: function (pm) {
    "" == pm["*"] && (pm = $.extend(!0, this.kag.stat.mp, $.cloneObject(pm)));
    for (key in pm) {
      var val = pm[key],
        c = "";
      val.length > 0 && (c = val.substr(0, 1));
      if (val.length > 0 && "&" === c)
        pm[key] = this.kag.embScript(val.substr(1, val.length));
      else if (val.length > 0 && "%" === c) {
        var map_obj = this.kag.getStack("macro");
        map_obj && (pm[key] = map_obj.pm[val.substr(1, val.length)]);
        var d = val.split("|");
        2 == d.length &&
          (map_obj.pm[$.trim(d[0]).substr(1, $.trim(d[0]).length)]
            ? (pm[key] =
                map_obj.pm[$.trim(d[0]).substr(1, $.trim(d[0]).length)])
            : (pm[key] = $.trim(d[1])));
      }
    }
    return pm;
  },
  checkVital: function (tag) {
    var master_tag = this.master_tag[tag.name],
      err_str = "";
    if (!master_tag.vital) return "";
    for (var array_vital = master_tag.vital, i = 0; i < array_vital.length; i++)
      tag.pm[array_vital[i]]
        ? "" == tag.pm[array_vital[i]] &&
          (err_str +=
            "タグ「" +
            tag.name +
            "」にパラメーター「" +
            array_vital[i] +
            "」は必須です　\n")
        : (err_str +=
            "タグ「" +
            tag.name +
            "」にパラメーター「" +
            array_vital[i] +
            "」は必須です　\n");
    return err_str;
  },
  checkCond: function (tag) {
    var pm = tag.pm;
    if (pm.cond) {
      var cond = pm.cond;
      return this.kag.embScript(cond);
    }
    return !0;
  },
  startTag: function (name, pm) {
    void 0 === pm && (pm = {});
    pm._tag = name;
    this.master_tag[name].start(
      $.extend(!0, $.cloneObject(this.master_tag[name].pm), pm)
    );
  },
  nextOrderWithLabel: function (label_name, scenario_file) {
    this.kag.stat.is_strong_stop = !1;
    if (label_name) {
      -1 != label_name.indexOf("*") &&
        (label_name = label_name.substr(1, label_name.length));
      this.kag.ftag.startTag("label", {
        label_name: label_name,
        nextorder: "false",
      });
    }
    if ("*savesnap" != label_name) {
      var that = this,
        original_scenario = scenario_file;
      label_name = label_name || "";
      scenario_file = scenario_file || this.kag.stat.current_scenario;
      label_name = label_name.replace("*", "");
      if (
        scenario_file != this.kag.stat.current_scenario &&
        null != original_scenario
      ) {
        this.kag.layer.hideEventLayer();
        this.kag.loadScenario(scenario_file, function (array_tag) {
          that.kag.layer.showEventLayer();
          that.kag.ftag.buildTag(array_tag, label_name);
        });
      } else if ("" == label_name) {
        this.current_order_index = -1;
        this.nextOrder();
      } else if (this.kag.stat.map_label[label_name]) {
        var label_obj = this.kag.stat.map_label[label_name];
        this.current_order_index = label_obj.index;
        this.nextOrder();
      } else {
        $.error_message(
          $.lang("label") + "：'" + label_name + "'" + $.lang("not_exists")
        );
        this.nextOrder();
      }
    } else {
      var tmpsnap = this.kag.menu.snap,
        co = tmpsnap.current_order_index,
        cs = tmpsnap.stat.current_scenario;
      this.nextOrderWithIndex(co, cs, void 0, void 0, "snap");
    }
  },
  nextOrderWithIndex: function (index, scenario_file, flag, insert, auto_next) {
    this.kag.stat.is_strong_stop = !1;
    this.kag.layer.showEventLayer();
    var that = this;
    flag = flag || !1;
    auto_next = auto_next || "yes";
    if (
      (scenario_file = scenario_file || this.kag.stat.current_scenario) !=
        this.kag.stat.current_scenario ||
      1 == flag
    ) {
      this.kag.layer.hideEventLayer();
      this.kag.loadScenario(scenario_file, function (tmp_array_tag) {
        var array_tag = $.extend(!0, [], tmp_array_tag);
        "object" == typeof insert && array_tag.splice(index + 1, 0, insert);
        that.kag.layer.showEventLayer();
        that.kag.ftag.buildTagIndex(array_tag, index, auto_next);
      });
    } else {
      this.current_order_index = index;
      if ("yes" == auto_next) this.nextOrder();
      else if ("snap" == auto_next) {
        this.kag.stat.is_strong_stop = this.kag.menu.snap.stat.is_strong_stop;
        1 == this.kag.stat.is_skip &&
          0 == this.kag.stat.is_strong_stop &&
          this.kag.ftag.nextOrder();
      } else "stop" == auto_next && this.kag.ftag.startTag("s", { val: {} });
    }
  },
};
tyrano.plugin.kag.tag.text = {
  cw: !0,
  pm: { val: "", backlog: "add" },
  start: function (pm) {
    if (1 != this.kag.stat.is_script)
      if (1 != this.kag.stat.is_html) {
        var j_inner_message = this.kag.getMessageInnerLayer();
        j_inner_message.css({
          "letter-spacing": this.kag.config.defaultPitch + "px",
          "line-height":
            parseInt(this.kag.config.defaultFontSize) +
            parseInt(this.kag.config.defaultLineSpacing) +
            "px",
          "font-family": this.kag.config.userFace,
        });
        this.kag.stat.current_message_str = pm.val;
        if ("true" == this.kag.stat.vertical) {
          if ("false" != this.kag.config.defaultAutoReturn) {
            var j_outer_message = this.kag.getMessageOuterLayer(),
              limit_width = 0.8 * parseInt(j_outer_message.css("width"));
            parseInt(j_inner_message.find("p").css("width")) > limit_width &&
              (this.kag.stat.vchat.is_active
                ? this.kag.ftag.startTag("vchat_in", {})
                : this.kag.getMessageInnerLayer().html(""));
          }
          this.showMessage(pm.val, pm, !0);
        } else {
          if ("false" != this.kag.config.defaultAutoReturn) {
            j_outer_message = this.kag.getMessageOuterLayer();
            var limit_height = 0.8 * parseInt(j_outer_message.css("height"));
            parseInt(j_inner_message.find("p").css("height")) > limit_height &&
              (this.kag.stat.vchat.is_active
                ? this.kag.ftag.startTag("vchat_in", {})
                : this.kag.getMessageInnerLayer().html(""));
          }
          this.showMessage(pm.val, pm, !1);
        }
      } else {
        this.kag.stat.map_html.buff_html += pm.val;
        this.kag.ftag.nextOrder();
      }
    else {
      this.kag.stat.buff_script += pm.val + "\n";
      this.kag.ftag.nextOrder();
    }
  },
  showMessage: function (message_str, pm, isVertical) {
    var that = this;
    "true" == that.kag.stat.log_join && (pm.backlog = "join");
    var chara_name = "";
    "" != this.kag.stat.chara_ptext &&
      (chara_name = $.isNull($("." + this.kag.stat.chara_ptext).html()));
    if (
      ("" != chara_name && "join" != pm.backlog) ||
      ("" != chara_name && "true" == this.kag.stat.f_chara_ptext)
    ) {
      this.kag.pushBackLog(
        "<b class='backlog_chara_name " +
          chara_name +
          "'>" +
          chara_name +
          "</b>：<span class='backlog_text " +
          chara_name +
          "'>" +
          message_str +
          "</span>",
        "add"
      );
      if ("true" == this.kag.stat.f_chara_ptext) {
        this.kag.stat.f_chara_ptext = "false";
        this.kag.stat.log_join = "true";
      }
    } else {
      var log_str =
        "<span class='backlog_text " +
        chara_name +
        "'>" +
        message_str +
        "</span>";
      "join" == pm.backlog
        ? this.kag.pushBackLog(log_str, "join")
        : this.kag.pushBackLog(log_str, "add");
    }
    1 == that.kag.stat.play_speak &&
      speechSynthesis.speak(new SpeechSynthesisUtterance(message_str));
    that.kag.ftag.hideNextImg();
    var j_msg_inner = this.kag.getMessageInnerLayer();
    this.kag.stat.vchat.is_active && j_msg_inner.show();
    !(function (jtext) {
      "" == jtext.html() &&
        (isVertical
          ? jtext.append("<p class='vertical_text'></p>")
          : jtext.append("<p class=''></p>"));
      var current_str = "";
      if (0 != jtext.find("p").find(".current_span").length) {
        jtext
          .find("p")
          .find(".current_span")
          .find("span")
          .css({ opacity: 1, visibility: "visible", animation: "" });
        current_str = jtext.find("p").find(".current_span").html();
      }
      that.kag.checkMessage(jtext);
      var j_span = {};
      if (that.kag.stat.vchat.is_active) {
        j_span = jtext.find(".current_span");
        if ("" == chara_name) {
          $(".current_vchat").find(".vchat_chara_name").remove();
          $(".current_vchat")
            .find(".vchat-text-inner")
            .css("margin-top", "0.2em");
        } else {
          $(".current_vchat").find(".vchat_chara_name").html(chara_name);
          var vchat_name_color = $.convertColor(
              that.kag.stat.vchat.chara_name_color
            ),
            cpm = that.kag.stat.vchat.charas[chara_name];
          cpm &&
            "" != cpm.color &&
            (vchat_name_color = $.convertColor(cpm.color));
          $(".current_vchat")
            .find(".vchat_chara_name")
            .css("background-color", vchat_name_color);
          $(".current_vchat")
            .find(".vchat-text-inner")
            .css("margin-top", "1.5em");
        }
      } else {
        (j_span = that.kag.getMessageCurrentSpan()).css({
          color: that.kag.stat.font.color,
          "font-weight": that.kag.stat.font.bold,
          "font-size": that.kag.stat.font.size + "px",
          "font-family": that.kag.stat.font.face,
          "font-style": that.kag.stat.font.italic,
        });
        if ("" != that.kag.stat.font.edge) {
          var edge_color = that.kag.stat.font.edge;
          j_span.css(
            "text-shadow",
            "1px 1px 0 " +
              edge_color +
              ", -1px 1px 0 " +
              edge_color +
              ",1px -1px 0 " +
              edge_color +
              ",-1px -1px 0 " +
              edge_color
          );
        } else
          "" != that.kag.stat.font.shadow &&
            j_span.css(
              "text-shadow",
              "2px 2px 2px " + that.kag.stat.font.shadow
            );
      }
      "true" == that.kag.config.autoRecordLabel &&
        (1 == that.kag.stat.already_read
          ? "default" != that.kag.config.alreadyReadTextColor &&
            j_span.css(
              "color",
              $.convertColor(that.kag.config.alreadyReadTextColor)
            )
          : "false" == that.kag.config.unReadTextSkip &&
            (that.kag.stat.is_skip = !1));
      var ch_speed = 30;
      "" != that.kag.stat.ch_speed
        ? (ch_speed = parseInt(that.kag.stat.ch_speed))
        : that.kag.config.chSpeed &&
          (ch_speed = parseInt(that.kag.config.chSpeed));
      (void 0 !== that.kag.stat.font.effect &&
        "none" != that.kag.stat.font.effect) ||
        (that.kag.stat.font.effect = "");
      var flag_in_block = !0;
      ("" != that.kag.stat.font.effect &&
        "fadeIn" != that.kag.stat.font.effect) ||
        (flag_in_block = !1);
      for (var append_str = "", i = 0; i < message_str.length; i++) {
        var c = message_str.charAt(i);
        if ("" != that.kag.stat.ruby_str) {
          c =
            "<ruby><rb>" +
            c +
            "</rb><rt>" +
            that.kag.stat.ruby_str +
            "</rt></ruby>";
          that.kag.stat.ruby_str = "";
        }
        append_str +=
          " " == c
            ? "<span style='opacity:0'>" + c + "</span>"
            : flag_in_block
            ? "<span style='display:inline-block;opacity:0'>" + c + "</span>"
            : "<span style='opacity:0'>" + c + "</span>";
      }
      current_str += "<span>" + append_str + "</span>";
      that.kag.appendMessage(jtext, current_str);
      var append_span = j_span.children("span:last-child"),
        pchar = function (index) {
          var isOneByOne =
            1 != that.kag.stat.is_skip &&
            1 != that.kag.stat.is_nowait &&
            ch_speed >= 3;
          isOneByOne &&
            (function (index) {
              if ("" != that.kag.stat.font.effect) {
                append_span
                  .children("span:eq(" + index + ")")
                  .on("animationend", function (e) {
                    $(e.target).css({
                      opacity: 1,
                      visibility: "visible",
                      animation: "",
                    });
                  });
                append_span
                  .children("span:eq(" + index + ")")
                  .css(
                    "animation",
                    "t" +
                      that.kag.stat.font.effect +
                      " " +
                      that.kag.stat.font.effect_speed +
                      " ease 0s 1 normal forwards"
                  );
              } else
                append_span
                  .children("span:eq(" + index + ")")
                  .css({ visibility: "visible", opacity: "1" });
            })(index);
          if (index <= message_str.length) {
            that.kag.stat.is_adding_text = !0;
            1 == that.kag.stat.is_click_text ||
            1 == that.kag.stat.is_skip ||
            1 == that.kag.stat.is_nowait
              ? pchar(++index)
              : setTimeout(function () {
                  pchar(++index);
                }, ch_speed);
          } else {
            that.kag.stat.is_adding_text = !1;
            that.kag.stat.is_click_text = !1;
            if ("true" != that.kag.stat.is_stop)
              if (isOneByOne)
                that.kag.stat.is_hide_message || that.kag.ftag.nextOrder();
              else {
                append_span
                  .children("span")
                  .css({ visibility: "visible", opacity: "1" });
                setTimeout(function () {
                  that.kag.stat.is_hide_message || that.kag.ftag.nextOrder();
                }, parseInt(that.kag.config.skipSpeed));
              }
          }
        };
      pchar(0);
    })(j_msg_inner);
  },
  nextOrder: function () {},
  test: function () {},
};
tyrano.plugin.kag.tag.label = {
  pm: { nextorder: "true" },
  start: function (pm) {
    if ("true" == this.kag.config.autoRecordLabel) {
      var sf_tmp =
          "trail_" +
          this.kag.stat.current_scenario
            .replace(".ks", "")
            .replace(/\u002f/g, "")
            .replace(/:/g, "")
            .replace(/\./g, ""),
        sf_buff = this.kag.stat.buff_label_name,
        sf_label = sf_tmp + "_" + pm.label_name;
      if ("" != this.kag.stat.buff_label_name) {
        this.kag.variable.sf.record || (this.kag.variable.sf.record = {});
        var sf_str = "sf.record." + sf_buff,
          scr_str = sf_str + " = " + sf_str + "  || 0;" + sf_str + "++;";
        this.kag.evalScript(scr_str);
      }
      this.kag.variable.sf.record &&
        (this.kag.variable.sf.record[sf_label]
          ? (this.kag.stat.already_read = !0)
          : (this.kag.stat.already_read = !1));
      this.kag.stat.buff_label_name = sf_label;
    }
    "true" == pm.nextorder && this.kag.ftag.nextOrder();
  },
};
tyrano.plugin.kag.tag.config_record_label = {
  pm: { color: "", skip: "" },
  start: function (pm) {
    if ("" != pm.color) {
      this.kag.config.alreadyReadTextColor = pm.color;
      this.kag.ftag.startTag("eval", {
        exp: "sf._system_config_already_read_text_color = " + pm.color,
      });
    }
    if ("" != pm.skip) {
      "true" == pm.skip
        ? (this.kag.config.unReadTextSkip = "true")
        : (this.kag.config.unReadTextSkip = "false");
      this.kag.ftag.startTag("eval", {
        exp: "sf._system_config_unread_text_skip = '" + pm.skip + "'",
      });
    }
    this.kag.ftag.nextOrder();
  },
};
tyrano.plugin.kag.tag.l = {
  cw: !0,
  start: function () {
    var that = this;
    this.kag.ftag.showNextImg();
    if (1 == this.kag.stat.is_skip) this.kag.ftag.nextOrder();
    else if (1 == this.kag.stat.is_auto) {
      this.kag.stat.is_wait_auto = !0;
      var auto_speed = that.kag.config.autoSpeed;
      if ("0" != that.kag.config.autoSpeedWithText) {
        var cnt_text = this.kag.stat.current_message_str.length;
        auto_speed =
          parseInt(auto_speed) +
          parseInt(that.kag.config.autoSpeedWithText) * cnt_text;
      }
      setTimeout(function () {
        1 == that.kag.stat.is_wait_auto &&
          (1 == that.kag.tmp.is_vo_play
            ? (that.kag.tmp.is_vo_play_wait = !0)
            : that.kag.ftag.nextOrder());
      }, auto_speed);
    }
  },
};
tyrano.plugin.kag.tag.p = {
  cw: !0,
  start: function () {
    var that = this;
    this.kag.stat.flag_ref_page = !0;
    this.kag.ftag.showNextImg();
    if (1 == this.kag.stat.is_skip) this.kag.ftag.nextOrder();
    else if (1 == this.kag.stat.is_auto) {
      this.kag.stat.is_wait_auto = !0;
      var auto_speed = that.kag.config.autoSpeed;
      if ("0" != that.kag.config.autoSpeedWithText) {
        var cnt_text = this.kag.stat.current_message_str.length;
        auto_speed =
          parseInt(auto_speed) +
          parseInt(that.kag.config.autoSpeedWithText) * cnt_text;
      }
      setTimeout(function () {
        1 == that.kag.stat.is_wait_auto &&
          (1 == that.kag.tmp.is_vo_play
            ? (that.kag.tmp.is_vo_play_wait = !0)
            : that.kag.ftag.nextOrder());
      }, auto_speed);
    }
  },
};
tyrano.plugin.kag.tag.graph = {
  vital: ["storage"],
  pm: { storage: null },
  start: function (pm) {
    var jtext = this.kag.getMessageInnerLayer(),
      current_str = "";
    0 != jtext.find("p").find(".current_span").length &&
      (current_str = jtext.find("p").find(".current_span").html());
    var storage_url = "";
    storage_url = $.isHTTP(pm.storage)
      ? pm.storage
      : "./data/image/" + pm.storage;
    this.kag.appendMessage(
      jtext,
      current_str + "<img src='" + storage_url + "' >"
    );
    this.kag.ftag.nextOrder();
  },
};
tyrano.plugin.kag.tag.jump = {
  pm: { storage: null, target: null, countpage: !0 },
  start: function (pm) {
    var that = this;
    setTimeout(function () {
      that.kag.ftag.nextOrderWithLabel(pm.target, pm.storage);
    }, 1);
  },
};
tyrano.plugin.kag.tag.r = {
  log_join: "true",
  start: function () {
    var that = this,
      j_inner_message = this.kag.getMessageInnerLayer(),
      txt = j_inner_message.find("p").find(".current_span").html() + "<br />";
    j_inner_message.find("p").find(".current_span").html(txt);
    setTimeout(function () {
      that.kag.ftag.nextOrder();
    }, 5);
  },
};
tyrano.plugin.kag.tag.er = {
  start: function () {
    this.kag.ftag.hideNextImg();
    this.kag.getMessageInnerLayer().html("");
    this.kag.ftag.startTag("resetfont");
  },
};
tyrano.plugin.kag.tag.cm = {
  start: function () {
    this.kag.ftag.hideNextImg();
    this.kag.stat.vchat.is_active
      ? this.kag.ftag.startTag("vchat_in", {})
      : this.kag.layer.clearMessageInnerLayerAll();
    this.kag.stat.log_clear = !0;
    this.kag.layer.getFreeLayer().html("").hide();
    this.kag.ftag.startTag("resetfont");
  },
};
tyrano.plugin.kag.tag.ct = {
  start: function () {
    this.kag.ftag.hideNextImg();
    this.kag.layer.clearMessageInnerLayerAll();
    this.kag.layer.getFreeLayer().html("").hide();
    this.kag.stat.current_layer = "message0";
    this.kag.stat.current_page = "fore";
    this.kag.ftag.startTag("resetfont");
  },
};
tyrano.plugin.kag.tag.current = {
  pm: { layer: "", page: "fore" },
  start: function (pm) {
    "" == pm.layer && (pm.layer = this.kag.stat.current_layer);
    this.kag.stat.current_layer = pm.layer;
    this.kag.stat.current_page = pm.page;
    this.kag.ftag.nextOrder();
  },
};
tyrano.plugin.kag.tag.position = {
  pm: {
    layer: "message0",
    page: "fore",
    left: "",
    top: "",
    width: "",
    height: "",
    color: "",
    opacity: "",
    vertical: "",
    frame: "",
    radius: "",
    marginl: "0",
    margint: "0",
    marginr: "0",
    marginb: "0",
  },
  start: function (pm) {
    var target_layer = this.kag.layer
        .getLayer(pm.layer, pm.page)
        .find(".message_outer"),
      new_style = {};
    "" != pm.left && (new_style.left = pm.left + "px");
    "" != pm.top && (new_style.top = pm.top + "px");
    "" != pm.width && (new_style.width = pm.width + "px");
    "" != pm.height && (new_style.height = pm.height + "px");
    "" != pm.color &&
      (new_style["background-color"] = $.convertColor(pm.color));
    "" != pm.radius &&
      target_layer.css("border-radius", parseInt(pm.radius) + "px");
    if ("none" == pm.frame) {
      target_layer.css(
        "opacity",
        $.convertOpacity(this.kag.config.frameOpacity)
      );
      target_layer.css("background-image", "");
      target_layer.css(
        "background-color",
        $.convertColor(this.kag.config.frameColor)
      );
    } else if ("" != pm.frame) {
      var storage_url = "";
      storage_url = $.isHTTP(pm.frame) ? pm.frame : "./data/image/" + pm.frame;
      target_layer.css("background-image", "url(" + storage_url + ")");
      target_layer.css("background-repeat", "no-repeat");
      target_layer.css("opacity", 1);
      target_layer.css("background-color", "");
    }
    "" != pm.opacity &&
      target_layer.css("opacity", $.convertOpacity(pm.opacity));
    this.kag.setStyles(target_layer, new_style);
    this.kag.layer.refMessageLayer(pm.layer);
    var layer_inner = this.kag.layer
      .getLayer(pm.layer, pm.page)
      .find(".message_inner");
    if ("" != pm.vertical)
      if ("true" == pm.vertical) {
        this.kag.stat.vertical = "true";
        layer_inner.find("p").addClass("vertical_text");
      } else {
        this.kag.stat.vertical = "false";
        layer_inner.find("p").removeClass("vertical_text");
      }
    var new_style_inner = {};
    "0" != pm.marginl &&
      (new_style_inner["padding-left"] = parseInt(pm.marginl) + "px");
    "0" != pm.margint &&
      (new_style_inner["padding-top"] = parseInt(pm.margint) + "px");
    "0" != pm.marginr &&
      (new_style_inner.width =
        parseInt(layer_inner.css("width")) -
        parseInt(pm.marginr) -
        parseInt(pm.marginl) +
        "px");
    "0" != pm.marginb &&
      (new_style_inner.height =
        parseInt(layer_inner.css("height")) -
        parseInt(pm.marginb) -
        parseInt(pm.margint) +
        "px");
    this.kag.setStyles(layer_inner, new_style_inner);
    this.kag.ftag.nextOrder();
  },
};
tyrano.plugin.kag.tag.image = {
  pm: {
    layer: "base",
    page: "fore",
    visible: "",
    top: "",
    left: "",
    x: "",
    y: "",
    width: "",
    height: "",
    pos: "",
    name: "",
    folder: "",
    time: "",
    wait: "true",
    depth: "front",
    reflect: "",
    zindex: "1",
  },
  start: function (pm) {
    var strage_url = "",
      folder = "",
      that = this;
    if ("base" != pm.layer) {
      var layer_new_style = {};
      "true" == pm.visible &&
        "fore" == pm.page &&
        (layer_new_style.display = "block");
      this.kag.setStyles(
        this.kag.layer.getLayer(pm.layer, pm.page),
        layer_new_style
      );
      if ("" != pm.pos)
        switch (pm.pos) {
          case "left":
          case "l":
            pm.left = this.kag.config["scPositionX.left"];
            break;
          case "left_center":
          case "lc":
            pm.left = this.kag.config["scPositionX.left_center"];
            break;
          case "center":
          case "c":
            pm.left = this.kag.config["scPositionX.center"];
            break;
          case "right_center":
          case "rc":
            pm.left = this.kag.config["scPositionX.right_center"];
            break;
          case "right":
          case "r":
            pm.left = this.kag.config["scPositionX.right"];
        }
      folder = "" != pm.folder ? pm.folder : "fgimage";
      strage_url = $.isHTTP(pm.storage)
        ? pm.storage
        : "./data/" + folder + "/" + pm.storage;
      var img_obj = $("<img />");
      img_obj.attr("src", strage_url);
      img_obj.css("position", "absolute");
      img_obj.css("top", pm.top + "px");
      img_obj.css("left", pm.left + "px");
      "" != pm.width && img_obj.css("width", pm.width + "px");
      "" != pm.height && img_obj.css("height", pm.height + "px");
      "" != pm.x && img_obj.css("left", pm.x + "px");
      "" != pm.y && img_obj.css("top", pm.y + "px");
      "" != pm.zindex && img_obj.css("z-index", pm.zindex);
      "" != pm.reflect && "true" == pm.reflect && img_obj.addClass("reflect");
      $.setName(img_obj, pm.name);
      (0 != pm.time && "0" != pm.time) || (pm.time = "");
      if ("" != pm.time) {
        img_obj.css("opacity", 0);
        "back" == pm.depth
          ? this.kag.layer.getLayer(pm.layer, pm.page).prepend(img_obj)
          : this.kag.layer.getLayer(pm.layer, pm.page).append(img_obj);
        img_obj.animate({ opacity: 1 }, parseInt(pm.time), function () {
          "true" == pm.wait && that.kag.ftag.nextOrder();
        });
        "true" != pm.wait && that.kag.ftag.nextOrder();
      } else {
        "back" == pm.depth
          ? this.kag.layer.getLayer(pm.layer, pm.page).prepend(img_obj)
          : this.kag.layer.getLayer(pm.layer, pm.page).append(img_obj);
        this.kag.ftag.nextOrder();
      }
    } else {
      folder = "" != pm.folder ? pm.folder : "bgimage";
      var new_style = {
        "background-image":
          "url(" +
          (strage_url = $.isHTTP(pm.storage)
            ? pm.storage
            : "./data/" + folder + "/" + pm.storage) +
          ")",
        display: "none",
      };
      "fore" === pm.page && (new_style.display = "block");
      this.kag.setStyles(this.kag.layer.getLayer(pm.layer, pm.page), new_style);
      this.kag.ftag.nextOrder();
    }
  },
};
tyrano.plugin.kag.tag.freeimage = {
  vital: ["layer"],
  pm: { layer: "", page: "fore", time: "", wait: "true" },
  start: function (pm) {
    var that = this;
    if ("base" != pm.layer) {
      0 == pm.time && (pm.time = "");
      if ("" != pm.time) {
        var j_obj = this.kag.layer.getLayer(pm.layer, pm.page).children();
        if (!j_obj.get(0) && "true" == pm.wait) {
          that.kag.ftag.nextOrder();
          return;
        }
        var cnt = 0,
          s_cnt = j_obj.length;
        j_obj.animate({ opacity: 0 }, parseInt(pm.time), function () {
          that.kag.layer.getLayer(pm.layer, pm.page).empty();
          cnt++;
          s_cnt == cnt && "true" == pm.wait && that.kag.ftag.nextOrder();
        });
      } else {
        that.kag.layer.getLayer(pm.layer, pm.page).empty();
        that.kag.ftag.nextOrder();
      }
    } else {
      this.kag.layer.getLayer(pm.layer, pm.page).css("background-image", "");
      this.kag.ftag.nextOrder();
    }
    "false" == pm.wait && this.kag.ftag.nextOrder();
  },
};
tyrano.plugin.kag.tag.freelayer = tyrano.plugin.kag.tag.freeimage;
tyrano.plugin.kag.tag.free = {
  vital: ["layer", "name"],
  pm: { layer: "", page: "fore", name: "", wait: "true", time: "" },
  start: function (pm) {
    var that = this;
    if ("base" != pm.layer) {
      0 == pm.time && (pm.time = "");
      if ("" != pm.time) {
        if (
          !(j_obj = (j_obj = this.kag.layer.getLayer(pm.layer, pm.page)).find(
            "." + pm.name
          )).get(0) &&
          "true" == pm.wait
        ) {
          that.kag.ftag.nextOrder();
          return;
        }
        var cnt = 0,
          s_cnt = j_obj.length;
        j_obj.animate({ opacity: 0 }, parseInt(pm.time), function () {
          j_obj.remove();
          ++cnt == s_cnt && "true" == pm.wait && that.kag.ftag.nextOrder();
        });
        "false" == pm.wait && that.kag.ftag.nextOrder();
      } else {
        (j_obj = (j_obj = this.kag.layer.getLayer(pm.layer, pm.page)).find(
          "." + pm.name
        )).remove();
        that.kag.ftag.nextOrder();
      }
    } else {
      var j_obj;
      (j_obj = (j_obj = this.kag.layer.getLayer(pm.layer, pm.page)).find(
        "." + pm.name
      )).remove();
      this.kag.ftag.nextOrder();
    }
  },
};
tyrano.plugin.kag.tag.ptext = {
  vital: ["layer", "x", "y"],
  pm: {
    layer: "0",
    page: "fore",
    x: 0,
    y: 0,
    vertical: "false",
    text: "",
    size: "",
    face: "",
    color: "",
    italic: "",
    bold: "",
    align: "left",
    edge: "",
    shadow: "",
    name: "",
    time: "",
    width: "",
    zindex: "9999",
    overwrite: "false",
  },
  start: function (pm) {
    var that = this;
    "" == pm.face && (pm.face = that.kag.stat.font.face);
    "" == pm.color
      ? (pm.color = $.convertColor(that.kag.stat.font.color))
      : (pm.color = $.convertColor(pm.color));
    var font_new_style = {
      color: pm.color,
      "font-weight": pm.bold,
      "font-style": pm.fontstyle,
      "font-size": pm.size + "px",
      "font-family": pm.face,
      "z-index": "999",
      text: "",
    };
    if ("" != pm.edge) {
      var edge_color = $.convertColor(pm.edge);
      font_new_style["text-shadow"] =
        "1px 1px 0 " +
        edge_color +
        ", -1px 1px 0 " +
        edge_color +
        ",1px -1px 0 " +
        edge_color +
        ",-1px -1px 0 " +
        edge_color;
    } else
      "" != pm.shadow &&
        (font_new_style["text-shadow"] =
          "2px 2px 2px " + $.convertColor(pm.shadow));
    var target_layer = this.kag.layer.getLayer(pm.layer, pm.page);
    if (
      "true" == pm.overwrite &&
      "" != pm.name &&
      $("." + pm.name).length > 0
    ) {
      $("." + pm.name).html(pm.text);
      0 != pm.x && $("." + pm.name).css("left", parseInt(pm.x));
      0 != pm.y && $("." + pm.name).css("top", parseInt(pm.y));
      "" != pm.color && $("." + pm.name).css("color", $.convertColor(pm.color));
      "" != pm.size && $("." + pm.name).css("font-size", parseInt(pm.size));
      this.kag.ftag.nextOrder();
      return !1;
    }
    var tobj = $("<p></p>");
    tobj.css("position", "absolute");
    tobj.css("top", pm.y + "px");
    tobj.css("left", pm.x + "px");
    tobj.css("width", pm.width);
    tobj.css("text-align", pm.align);
    "true" == pm.vertical && tobj.addClass("vertical_text");
    $.setName(tobj, pm.name);
    tobj.html(pm.text);
    this.kag.setStyles(tobj, font_new_style);
    "fix" == pm.layer && tobj.addClass("fixlayer");
    if ("" != pm.time) {
      tobj.css("opacity", 0);
      target_layer.append(tobj);
      tobj.animate({ opacity: 1 }, parseInt(pm.time), function () {
        that.kag.ftag.nextOrder();
      });
    } else {
      target_layer.append(tobj);
      this.kag.ftag.nextOrder();
    }
  },
};
tyrano.plugin.kag.tag.mtext = {
  vital: ["x", "y"],
  pm: {
    layer: "0",
    page: "fore",
    x: 0,
    y: 0,
    vertical: "false",
    text: "",
    size: "",
    face: "",
    color: "",
    italic: "",
    bold: "",
    shadow: "",
    edge: "",
    name: "",
    zindex: "9999",
    width: "",
    align: "left",
    fadeout: "true",
    time: "2000",
    in_effect: "fadeIn",
    in_delay: "50",
    in_delay_scale: "1.5",
    in_sync: "false",
    in_shuffle: "false",
    in_reverse: "false",
    wait: "true",
    out_effect: "fadeOut",
    out_delay: "50",
    out_scale_delay: "",
    out_sync: "false",
    out_shuffle: "false",
    out_reverse: "false",
  },
  start: function (pm) {
    var that = this;
    "" == pm.face && (pm.face = that.kag.stat.font.face);
    "" == pm.color
      ? (pm.color = $.convertColor(that.kag.stat.font.color))
      : (pm.color = $.convertColor(pm.color));
    var font_new_style = {
      color: pm.color,
      "font-weight": pm.bold,
      "font-style": pm.fontstyle,
      "font-size": pm.size + "px",
      "font-family": pm.face,
      "z-index": "999",
      text: "",
    };
    if ("" != pm.edge) {
      var edge_color = $.convertColor(pm.edge);
      font_new_style["text-shadow"] =
        "1px 1px 0 " +
        edge_color +
        ", -1px 1px 0 " +
        edge_color +
        ",1px -1px 0 " +
        edge_color +
        ",-1px -1px 0 " +
        edge_color;
    } else
      "" != pm.shadow &&
        (font_new_style["text-shadow"] =
          "2px 2px 2px " + $.convertColor(pm.shadow));
    var target_layer = this.kag.layer.getLayer(pm.layer, pm.page),
      tobj = $("<p></p>");
    tobj.css("position", "absolute");
    tobj.css("top", pm.y + "px");
    tobj.css("left", pm.x + "px");
    tobj.css("width", pm.width);
    tobj.css("text-align", pm.align);
    "true" == pm.vertical && tobj.addClass("vertical_text");
    $.setName(tobj, pm.name);
    tobj.html(pm.text);
    this.kag.setStyles(tobj, font_new_style);
    "fix" == pm.layer && tobj.addClass("fixlayer");
    target_layer.append(tobj);
    for (key in pm)
      "true" == pm[key] ? (pm[key] = !0) : "false" == pm[key] && (pm[key] = !1);
    tobj.textillate({
      loop: pm.fadeout,
      minDisplayTime: pm.time,
      in: {
        effect: pm.in_effect,
        delayScale: pm.in_delay_scale,
        delay: pm.in_delay,
        sync: pm.in_sync,
        shuffle: pm.in_shuffle,
        reverse: pm.in_reverse,
        callback: function () {
          0 == pm.fadeout && 1 == pm.wait && that.kag.ftag.nextOrder();
        },
      },
      out: {
        effect: pm.out_effect,
        delayScale: pm.out_delay_scale,
        delay: pm.out_delay,
        sync: pm.out_sync,
        shuffle: pm.out_shuffle,
        reverse: pm.out_reverse,
        callback: function () {
          tobj.remove();
          1 == pm.wait && that.kag.ftag.nextOrder();
        },
      },
    });
    1 != pm.wait && this.kag.ftag.nextOrder();
  },
};
tyrano.plugin.kag.tag.backlay = {
  pm: { layer: "" },
  start: function (pm) {
    this.kag.layer.backlay(pm.layer);
    this.kag.ftag.nextOrder();
  },
};
tyrano.plugin.kag.tag.wt = {
  start: function (pm) {
    if (0 == this.kag.stat.is_trans) {
      this.kag.layer.showEventLayer();
      this.kag.ftag.nextOrder();
    } else this.kag.layer.hideEventLayer();
  },
};
tyrano.plugin.kag.tag.wb = {
  start: function (pm) {
    this.kag.layer.hideEventLayer();
  },
};
tyrano.plugin.kag.tag.link = {
  pm: { target: null, storage: null },
  start: function (pm) {
    var that = this,
      j_span = this.kag.setMessageCurrentSpan();
    j_span.css("cursor", "pointer");
    !(function () {
      pm.target, pm.storage;
      that.kag.event.addEventElement({ tag: "link", j_target: j_span, pm: pm });
      that.setEvent(j_span, pm);
    })();
    this.kag.ftag.nextOrder();
  },
  setEvent: function (j_span, pm) {
    var _target = pm.target,
      _storage = pm.storage,
      that = TYRANO;
    j_span.bind("click touchstart", function (e) {
      TYRANO.kag.ftag.nextOrderWithLabel(_target, _storage);
      TYRANO.kag.layer.showEventLayer();
      "true" == that.kag.stat.skip_link
        ? e.stopPropagation()
        : (that.kag.stat.is_skip = !1);
    });
    j_span.css("cursor", "pointer");
  },
};
tyrano.plugin.kag.tag.endlink = {
  start: function (pm) {
    this.kag.setMessageCurrentSpan();
    this.kag.ftag.nextOrder();
  },
};
tyrano.plugin.kag.tag.s = {
  start: function () {
    this.kag.stat.is_strong_stop = !0;
    this.kag.layer.hideEventLayer();
  },
};
tyrano.plugin.kag.tag._s = {
  vital: [],
  pm: {},
  start: function (pm) {
    this.kag.stat.strong_stop_recover_index = this.kag.ftag.current_order_index;
    this.kag.ftag.nextOrder();
  },
};
tyrano.plugin.kag.tag.wait = {
  vital: ["time"],
  pm: { time: 0 },
  start: function (pm) {
    var that = this;
    this.kag.stat.is_strong_stop = !0;
    this.kag.stat.is_wait = !0;
    this.kag.layer.hideEventLayer();
    that.kag.tmp.wait_id = setTimeout(function () {
      that.kag.stat.is_strong_stop = !1;
      that.kag.stat.is_wait = !1;
      that.kag.layer.showEventLayer();
      that.kag.ftag.nextOrder();
    }, pm.time);
  },
};
tyrano.plugin.kag.tag.wait_cancel = {
  vital: [],
  pm: {},
  start: function (pm) {
    clearTimeout(this.kag.tmp.wait_id);
    this.kag.tmp.wait_id = "";
    this.kag.stat.is_strong_stop = !1;
    this.kag.stat.is_wait = !1;
    this.kag.layer.showEventLayer();
    this.kag.ftag.nextOrder();
  },
};
tyrano.plugin.kag.tag.hidemessage = {
  start: function () {
    this.kag.stat.is_hide_message = !0;
    this.kag.layer.hideMessageLayers();
    this.kag.layer.layer_event.show();
  },
};
tyrano.plugin.kag.tag.quake = {
  vital: ["time"],
  pm: {
    count: 5,
    time: 300,
    timemode: "",
    hmax: "0",
    vmax: "10",
    wait: "true",
  },
  start: function (pm) {
    var that = this;
    "0" != pm.hmax
      ? $("." + this.kag.define.BASE_DIV_NAME).effect(
          "shake",
          {
            times: parseInt(pm.count),
            distance: parseInt(pm.hmax),
            direction: "left",
          },
          parseInt(pm.time),
          function () {
            "true" == pm.wait && that.kag.ftag.nextOrder();
          }
        )
      : "0" != pm.vmax &&
        $("." + this.kag.define.BASE_DIV_NAME).effect(
          "shake",
          {
            times: parseInt(pm.count),
            distance: parseInt(pm.vmax),
            direction: "up",
          },
          parseInt(pm.time),
          function () {
            "true" == pm.wait && that.kag.ftag.nextOrder();
          }
        );
    "false" == pm.wait && that.kag.ftag.nextOrder();
  },
};
tyrano.plugin.kag.tag.font = {
  pm: {},
  log_join: "true",
  start: function (pm) {
    this.kag.setMessageCurrentSpan();
    pm.size && (this.kag.stat.font.size = pm.size);
    pm.color && (this.kag.stat.font.color = $.convertColor(pm.color));
    pm.bold && (this.kag.stat.font.bold = $.convertBold(pm.bold));
    pm.face && (this.kag.stat.font.face = pm.face);
    pm.italic && (this.kag.stat.font.italic = $.convertItalic(pm.italic));
    pm.effect &&
      ("none" == pm.effect
        ? (this.kag.stat.font.effect = "")
        : (this.kag.stat.font.effect = pm.effect));
    pm.effect_speed && (this.kag.stat.font.effect_speed = pm.effect_speed);
    pm.edge &&
      ("none" == pm.edge || "" == pm.edge
        ? (this.kag.stat.font.edge = "")
        : (this.kag.stat.font.edge = $.convertColor(pm.edge)));
    pm.shadow &&
      ("none" == pm.shadow || "" == pm.shadow
        ? (this.kag.stat.font.shadow = "")
        : (this.kag.stat.font.shadow = $.convertColor(pm.shadow)));
    this.kag.ftag.nextOrder();
  },
};
tyrano.plugin.kag.tag.deffont = {
  pm: {},
  start: function (pm) {
    pm.size && (this.kag.stat.default_font.size = pm.size);
    pm.color && (this.kag.stat.default_font.color = $.convertColor(pm.color));
    pm.bold && (this.kag.stat.default_font.bold = $.convertBold(pm.bold));
    pm.face && (this.kag.stat.default_font.face = pm.face);
    pm.italic &&
      (this.kag.stat.default_font.italic = $.convertItalic(pm.italic));
    pm.effect &&
      ("none" == pm.effect
        ? (this.kag.stat.default_font.effect = "")
        : (this.kag.stat.default_font.effect = pm.effect));
    pm.effect_speed &&
      (this.kag.stat.default_font.effect_speed = pm.effect_speed);
    pm.edge &&
      ("none" == pm.edge || "" == pm.edge
        ? (this.kag.stat.default_font.edge = "")
        : (this.kag.stat.default_font.edge = $.convertColor(pm.edge)));
    pm.shadow &&
      ("none" == pm.shadow || "" == pm.shadow
        ? (this.kag.stat.default_font.shadow = "")
        : (this.kag.stat.default_font.shadow = $.convertColor(pm.shadow)));
    this.kag.ftag.nextOrder();
  },
};
tyrano.plugin.kag.tag.delay = {
  pm: { speed: "" },
  log_join: "true",
  start: function (pm) {
    "" != pm.speed && (this.kag.stat.ch_speed = parseInt(pm.speed));
    this.kag.ftag.nextOrder();
  },
};
tyrano.plugin.kag.tag.resetdelay = {
  pm: { speed: "" },
  log_join: "true",
  start: function (pm) {
    this.kag.stat.ch_speed = "";
    this.kag.ftag.nextOrder();
  },
};
tyrano.plugin.kag.tag.configdelay = {
  pm: { speed: "" },
  start: function (pm) {
    if ("" != pm.speed) {
      this.kag.stat.ch_speed = "";
      this.kag.config.chSpeed = pm.speed;
      this.kag.ftag.startTag("eval", {
        exp: "sf._config_ch_speed = " + pm.speed,
      });
    } else this.kag.ftag.nextOrder();
  },
};
tyrano.plugin.kag.tag.nowait = {
  pm: {},
  start: function (pm) {
    this.kag.stat.is_nowait = !0;
    this.kag.ftag.nextOrder();
  },
};
tyrano.plugin.kag.tag.endnowait = {
  pm: {},
  start: function (pm) {
    this.kag.stat.is_nowait = !1;
    this.kag.ftag.nextOrder();
  },
};
tyrano.plugin.kag.tag.resetfont = {
  log_join: "true",
  start: function () {
    this.kag.setMessageCurrentSpan();
    this.kag.stat.font = $.extend(!0, {}, this.kag.stat.default_font);
    this.kag.ftag.nextOrder();
  },
};
tyrano.plugin.kag.tag.layopt = {
  vital: ["layer"],
  pm: {
    layer: "",
    page: "fore",
    visible: "",
    left: "",
    top: "",
    opacity: "",
    autohide: !1,
    index: 10,
  },
  start: function (pm) {
    if ("message" == pm.layer) {
      pm.layer = this.kag.stat.current_layer;
      pm.page = this.kag.stat.current_page;
    }
    var j_layer = this.kag.layer.getLayer(pm.layer, pm.page);
    ("fix" != pm.layer && "fixlayer" != pm.layer) ||
      (j_layer = $("#tyrano_base").find(".fixlayer"));
    if ("" != pm.visible)
      if ("true" == pm.visible) {
        "fore" == pm.page && j_layer.css("display", "");
        j_layer.attr("l_visible", "true");
      } else {
        j_layer.css("display", "none");
        j_layer.attr("l_visible", "false");
      }
    "" != pm.left && j_layer.css("left", parseInt(pm.left));
    "" != pm.top && j_layer.css("top", parseInt(pm.top));
    "" != pm.opacity && j_layer.css("opacity", $.convertOpacity(pm.opacity));
    this.kag.ftag.nextOrder();
  },
};
tyrano.plugin.kag.tag.ruby = {
  vital: ["text"],
  pm: { text: "" },
  log_join: "true",
  start: function (pm) {
    var str = pm.text;
    this.kag.stat.ruby_str = str;
    this.kag.ftag.nextOrder();
  },
};
tyrano.plugin.kag.tag.cancelskip = {
  start: function (pm) {
    this.kag.stat.is_skip = !1;
    this.kag.ftag.nextOrder();
  },
};
tyrano.plugin.kag.tag.locate = {
  pm: { x: null, y: null },
  start: function (pm) {
    null != pm.x && (this.kag.stat.locate.x = pm.x);
    null != pm.y && (this.kag.stat.locate.y = pm.y);
    this.kag.ftag.nextOrder();
  },
};
tyrano.plugin.kag.tag.button = {
  pm: {
    graphic: "",
    storage: null,
    target: null,
    ext: "",
    name: "",
    x: "",
    y: "",
    width: "",
    height: "",
    fix: "false",
    savesnap: "false",
    folder: "image",
    exp: "",
    prevar: "",
    visible: "true",
    hint: "",
    clickse: "",
    enterse: "",
    leavese: "",
    clickimg: "",
    enterimg: "",
    auto_next: "yes",
    role: "",
  },
  start: function (pm) {
    var target_layer = null;
    "" != pm.role && (pm.fix = "true");
    "false" == pm.fix
      ? (target_layer = this.kag.layer.getFreeLayer()).css("z-index", 999999)
      : (target_layer = this.kag.layer.getLayer("fix"));
    var storage_url = "";
    storage_url = $.isHTTP(pm.graphic)
      ? pm.graphic
      : "./data/" + pm.folder + "/" + pm.graphic;
    var j_button = $("<img />");
    j_button.attr("src", storage_url);
    j_button.css("position", "absolute");
    j_button.css("cursor", "pointer");
    j_button.css("z-index", 99999999);
    "true" == pm.visible ? j_button.show() : j_button.hide();
    "" == pm.x
      ? j_button.css("left", this.kag.stat.locate.x + "px")
      : j_button.css("left", pm.x + "px");
    "" == pm.y
      ? j_button.css("top", this.kag.stat.locate.y + "px")
      : j_button.css("top", pm.y + "px");
    "false" != pm.fix && j_button.addClass("fixlayer");
    "" != pm.width && j_button.css("width", pm.width + "px");
    "" != pm.height && j_button.css("height", pm.height + "px");
    "" != pm.hint && j_button.attr({ title: pm.hint, alt: pm.hint });
    $.setName(j_button, pm.name);
    this.kag.event.addEventElement({
      tag: "button",
      j_target: j_button,
      pm: pm,
    });
    this.setEvent(j_button, pm);
    target_layer.append(j_button);
    "false" == pm.fix && target_layer.show();
    this.kag.ftag.nextOrder();
  },
  setEvent: function (j_button, pm) {
    var that = TYRANO;
    !(function () {
      var _target = pm.target,
        _storage = pm.storage,
        _pm = pm,
        preexp = that.kag.embScript(pm.preexp),
        button_clicked = !1;
      j_button.hover(
        function () {
          "" != _pm.enterse &&
            that.kag.ftag.startTag("playse", {
              storage: _pm.enterse,
              stop: !0,
            });
          if ("" != _pm.enterimg) {
            var enter_img_url = "";
            enter_img_url = $.isHTTP(_pm.enterimg)
              ? _pm.enterimg
              : "./data/" + _pm.folder + "/" + _pm.enterimg;
            $(this).attr("src", enter_img_url);
          }
        },
        function () {
          "" != _pm.leavese &&
            that.kag.ftag.startTag("playse", {
              storage: _pm.leavese,
              stop: !0,
            });
          if ("" != _pm.enterimg) {
            var enter_img_url = "";
            enter_img_url = $.isHTTP(_pm.graphic)
              ? _pm.graphic
              : "./data/" + _pm.folder + "/" + _pm.graphic;
            $(this).attr("src", enter_img_url);
          }
        }
      );
      j_button.click(function (event) {
        if ("" != _pm.clickimg) {
          var click_img_url = "";
          click_img_url = $.isHTTP(_pm.clickimg)
            ? _pm.clickimg
            : "./data/" + _pm.folder + "/" + _pm.clickimg;
          j_button.attr("src", click_img_url);
        }
        if (1 == button_clicked && "false" == _pm.fix) return !1;
        if (1 != that.kag.stat.is_strong_stop && "false" == _pm.fix) return !1;
        button_clicked = !0;
        "" != _pm.exp && that.kag.embScript(_pm.exp, preexp);
        if ("true" == _pm.savesnap) {
          if (1 == that.kag.stat.is_stop) return !1;
          that.kag.menu.snapSave(that.kag.stat.current_save_str);
        }
        if (
          "none" == that.kag.layer.layer_event.css("display") &&
          1 != that.kag.stat.is_strong_stop
        )
          return !1;
        if ("" != _pm.role) {
          that.kag.stat.is_skip = !1;
          "auto" != _pm.role &&
            that.kag.ftag.startTag("autostop", { next: "false" });
          if (
            !(
              ("save" != _pm.role &&
                "menu" != _pm.role &&
                "quicksave" != _pm.role &&
                "sleepgame" != _pm.role) ||
              (1 != that.kag.stat.is_adding_text && 1 != that.kag.stat.is_wait)
            )
          )
            return !1;
          switch (_pm.role) {
            case "save":
              that.kag.menu.displaySave();
              break;
            // tyrano/plugins/kag/kag.menu.js で定義した
            // displayOriginalSystem を使う
            case "original_system":
              that.kag.menu.displayOriginalSystem();
              break;
            case "load":
              that.kag.menu.displayLoad();
              break;
            case "window":
              that.kag.layer.hideMessageLayers();
              break;
            case "title":
              that.kag.backTitle();
              break;
            case "menu":
              that.kag.menu.showMenu();
              break;
            case "skip":
              that.kag.ftag.startTag("skipstart", {});
              break;
            case "backlog":
              that.kag.menu.displayLog();
              break;
            case "fullscreen":
              that.kag.menu.screenFull();
              break;
            case "quicksave":
              that.kag.menu.setQuickSave();
              break;
            case "quickload":
              that.kag.menu.loadQuickSave();
              break;
            case "auto":
              1 == that.kag.stat.is_auto
                ? that.kag.ftag.startTag("autostop", { next: "false" })
                : that.kag.ftag.startTag("autostart", {});
              break;
            case "sleepgame":
              j_button.trigger("mouseout");
              if (null != that.kag.tmp.sleep_game) return !1;
              that.kag.tmp.sleep_game = {};
              _pm.next = !1;
              that.kag.ftag.startTag("sleepgame", _pm);
          }
          "" != _pm.clickse &&
            that.kag.ftag.startTag("playse", {
              storage: _pm.clickse,
              stop: !0,
            });
          event.stopPropagation();
          return !1;
        }
        "" != _pm.clickse &&
          that.kag.ftag.startTag("playse", { storage: _pm.clickse, stop: !0 });
        that.kag.layer.showEventLayer();
        if ("" == _pm.role && "true" == _pm.fix) {
          var stack_pm = that.kag.getStack("call");
          if (null != stack_pm) {
            that.kag.log(
              "callスタックが残っている場合、fixボタンは反応しません"
            );
            that.kag.log(stack_pm);
            return !1;
          }
          var _auto_next = _pm.auto_next;
          1 == that.kag.stat.is_strong_stop && (_auto_next = "stop");
          that.kag.ftag.startTag("call", {
            storage: _storage,
            target: _target,
            auto_next: _auto_next,
          });
        } else that.kag.ftag.startTag("jump", _pm);
        "true" == that.kag.stat.skip_link
          ? event.stopPropagation()
          : (that.kag.stat.is_skip = !1);
      });
    })();
  },
};
tyrano.plugin.kag.tag.glink = {
  pm: {
    color: "black",
    font_color: "",
    storage: null,
    target: null,
    name: "",
    text: "",
    x: "auto",
    y: "",
    width: "",
    height: "",
    size: 30,
    graphic: "",
    enterimg: "",
    clickse: "",
    enterse: "",
    leavese: "",
    face: "",
  },
  start: function (pm) {
    var target_layer = null;
    (target_layer = this.kag.layer.getFreeLayer()).css("z-index", 999999);
    var j_button = $("<div class='glink_button'>" + pm.text + "</div>");
    j_button.css("position", "absolute");
    j_button.css("cursor", "pointer");
    j_button.css("z-index", 99999999);
    j_button.css("font-size", pm.size + "px");
    "" != pm.font_color && j_button.css("color", $.convertColor(pm.font_color));
    "" != pm.height && j_button.css("height", pm.height + "px");
    "" != pm.width && j_button.css("width", pm.width + "px");
    if ("" != pm.graphic) {
      j_button.removeClass("glink_button").addClass("button_graphic");
      var img_url = "./data/image/" + pm.graphic;
      j_button.css("background-image", "url(" + img_url + ")");
      j_button.css("background-repeat", "no-repeat");
      j_button.css("background-position", "center center");
      j_button.css("background-size", "100% 100%");
    } else j_button.addClass(pm.color);
    "" != pm.face
      ? j_button.css("font-family", pm.face)
      : "" != this.kag.stat.font.face &&
        j_button.css("font-family", this.kag.stat.font.face);
    if ("auto" == pm.x) {
      var sc_width = parseInt(this.kag.config.scWidth),
        center = Math.floor(parseInt(j_button.css("width")) / 2),
        first_left = Math.floor(sc_width / 2) - center;
      j_button.css("left", first_left + "px");
    } else
      "" == pm.x
        ? j_button.css("left", this.kag.stat.locate.x + "px")
        : j_button.css("left", pm.x + "px");
    "" == pm.y
      ? j_button.css("top", this.kag.stat.locate.y + "px")
      : j_button.css("top", pm.y + "px");
    $.setName(j_button, pm.name);
    this.kag.event.addEventElement({
      tag: "glink",
      j_target: j_button,
      pm: pm,
    });
    this.setEvent(j_button, pm);
    target_layer.append(j_button);
    target_layer.show();
    this.kag.ftag.nextOrder();
  },
  setEvent: function (j_button, pm) {
    var that = TYRANO;
    !(function () {
      pm.target, pm.storage;
      var _pm = pm,
        preexp = that.kag.embScript(pm.preexp);
      j_button.click(function (e) {
        "" != _pm.clickse &&
          that.kag.ftag.startTag("playse", { storage: _pm.clickse, stop: !0 });
        if (1 != that.kag.stat.is_strong_stop) return !1;
        !0;
        "" != _pm.exp && that.kag.embScript(_pm.exp, preexp);
        that.kag.layer.showEventLayer();
        that.kag.ftag.startTag("cm", {});
        that.kag.ftag.startTag("jump", _pm);
        "true" == that.kag.stat.skip_link
          ? e.stopPropagation()
          : (that.kag.stat.is_skip = !1);
      });
      j_button.hover(
        function () {
          if ("" != _pm.enterimg) {
            var enterimg_url = "./data/image/" + _pm.enterimg;
            j_button.css("background-image", "url(" + enterimg_url + ")");
          }
          "" != _pm.enterse &&
            that.kag.ftag.startTag("playse", {
              storage: _pm.enterse,
              stop: !0,
            });
        },
        function () {
          if ("" != _pm.enterimg) {
            var img_url = "./data/image/" + _pm.graphic;
            j_button.css("background-image", "url(" + img_url + ")");
          }
          "" != _pm.leavese &&
            that.kag.ftag.startTag("playse", {
              storage: _pm.leavese,
              stop: !0,
            });
        }
      );
    })();
  },
};
tyrano.plugin.kag.tag.clickable = {
  vital: ["width", "height"],
  pm: {
    width: "0",
    height: "0",
    x: "",
    y: "",
    border: "none",
    color: "",
    mouseopacity: "",
    opacity: "140",
    storage: null,
    target: null,
    name: "",
  },
  start: function (pm) {
    var layer_free = this.kag.layer.getFreeLayer();
    layer_free.css("z-index", 9999999);
    var j_button = $("<div />");
    j_button.css("position", "absolute");
    j_button.css("cursor", "pointer");
    j_button.css("top", this.kag.stat.locate.y + "px");
    j_button.css("left", this.kag.stat.locate.x + "px");
    j_button.css("width", pm.width + "px");
    j_button.css("height", pm.height + "px");
    j_button.css("opacity", $.convertOpacity(pm.opacity));
    j_button.css("background-color", $.convertColor(pm.color));
    j_button.css("border", $.replaceAll(pm.border, ":", " "));
    "" != pm.x && j_button.css("left", parseInt(pm.x));
    "" != pm.y && j_button.css("top", parseInt(pm.y));
    this.kag.event.addEventElement({
      tag: "clickable",
      j_target: j_button,
      pm: pm,
    });
    this.setEvent(j_button, pm);
    layer_free.append(j_button);
    layer_free.show();
    this.kag.ftag.nextOrder();
  },
  setEvent: function (j_button, pm) {
    var that = TYRANO;
    !(function () {
      pm.target, pm.storage;
      var _pm = pm;
      if ("" != _pm.mouseopacity) {
        j_button.bind("mouseover", function () {
          j_button.css("opacity", $.convertOpacity(_pm.mouseopacity));
        });
        j_button.bind("mouseout", function () {
          j_button.css("opacity", $.convertOpacity(_pm.opacity));
        });
      }
      j_button.click(function () {
        if (0 == (1 == that.kag.stat.is_strong_stop)) return !1;
        that.kag.ftag.startTag("cm", {});
        that.kag.layer.showEventLayer();
        that.kag.ftag.startTag("jump", _pm);
      });
    })();
  },
};
tyrano.plugin.kag.tag.glyph = {
  pm: {
    line: "nextpage.gif",
    layer: "message0",
    fix: "false",
    left: 0,
    top: 0,
  },
  start: function (pm) {
    $(".glyph_image").remove();
    if ("true" == pm.fix) {
      var j_layer = this.kag.layer.getLayer(pm.layer),
        j_next = $("<img class='glyph_image' />");
      j_next.attr("src", "./tyrano/images/system/white.png");
      j_next.css("position", "absolute");
      j_next.css("z-index", 99999);
      j_next.css("top", pm.top + "px");
      j_next.css("left", pm.left + "px");
      j_next.css("display", "none");
      j_layer.append(j_next);
      this.kag.stat.flag_glyph = "true";
    } else this.kag.stat.flag_glyph = "false";
    this.kag.ftag.nextOrder();
  },
};
tyrano.plugin.kag.tag.trans = {
  vital: ["time", "layer"],
  pm: { layer: "base", method: "fadeIn", children: !1, time: 1500 },
  start: function (pm) {
    this.kag.ftag.hideNextImg();
    this.kag.stat.is_trans = !0;
    var that = this;
    $.countObj(this.kag.layer.map_layer_fore);
    "false" == pm.children && 0;
    var map_layer_fore = $.cloneObject(this.kag.layer.map_layer_fore),
      map_layer_back = $.cloneObject(this.kag.layer.map_layer_back);
    for (key in map_layer_fore)
      (1 != pm.children && key !== pm.layer) ||
        (function () {
          var _key = key,
            layer_back = (map_layer_fore[_key], map_layer_back[_key]);
          if (
            -1 != _key.indexOf("message") &&
            "false" == layer_back.attr("l_visible")
          ) {
            0;
            that.kag.layer.forelay(_key);
          } else
            $.trans(
              pm.method,
              layer_back,
              parseInt(pm.time),
              "show",
              function () {
                0;
                that.kag.layer.forelay(_key);
                that.kag.ftag.completeTrans();
                that.kag.ftag.hideNextImg();
              }
            );
        })();
    this.kag.ftag.nextOrder();
  },
};
tyrano.plugin.kag.tag.bg = {
  vital: ["storage"],
  pm: {
    storage: "",
    method: "crossfade",
    wait: "true",
    time: 3e3,
    cross: "false",
  },
  start: function (pm) {
    this.kag.ftag.hideNextImg();
    var that = this;
    0 == pm.time && (pm.wait = "false");
    var storage_url = "./data/bgimage/" + pm.storage;
    $.isHTTP(pm.storage) && (storage_url = pm.storage);
    this.kag.preload(storage_url, function () {
      var j_old_bg = that.kag.layer.getLayer("base", "fore"),
        j_new_bg = j_old_bg.clone(!1);
      j_new_bg.css("background-image", "url(" + storage_url + ")");
      j_new_bg.css("display", "none");
      j_old_bg.after(j_new_bg);
      that.kag.ftag.hideNextImg();
      that.kag.layer.updateLayer("base", "fore", j_new_bg);
      "true" == pm.wait && that.kag.layer.hideEventLayer();
      pm.time = that.kag.cutTimeWithSkip(pm.time);
      "true" == pm.cross &&
        $.trans(pm.method, j_old_bg, parseInt(pm.time), "hide", function () {
          j_old_bg.remove();
        });
      $.trans(pm.method, j_new_bg, parseInt(pm.time), "show", function () {
        j_new_bg.css("opacity", 1);
        "false" == pm.cross && j_old_bg.remove();
        if ("true" == pm.wait) {
          that.kag.layer.showEventLayer();
          that.kag.ftag.nextOrder();
        }
      });
    });
    "false" == pm.wait && this.kag.ftag.nextOrder();
  },
};
tyrano.plugin.kag.tag.bg2 = {
  vital: ["storage"],
  pm: {
    name: "",
    storage: "",
    method: "crossfade",
    wait: "true",
    time: 3e3,
    width: "",
    height: "",
    left: "",
    top: "",
    cross: "false",
  },
  start: function (pm) {
    this.kag.ftag.hideNextImg();
    var that = this;
    0 == pm.time && (pm.wait = "false");
    var storage_url = "./data/bgimage/" + pm.storage;
    $.isHTTP(pm.storage) && (storage_url = pm.storage);
    this.kag.preload(storage_url, function () {
      var j_old_bg = that.kag.layer.getLayer("base", "fore"),
        j_new_bg = j_old_bg.clone(!1),
        j_bg_img = $("<img />");
      j_bg_img.css("position", "absolute");
      var scWidth = parseInt(that.kag.config.scWidth),
        scHeight = parseInt(that.kag.config.scHeight),
        left = 0,
        top = 0;
      "" != pm.width && (scWidth = parseInt(pm.width));
      "" != pm.height && (scHeight = parseInt(pm.height));
      "" != pm.left && (left = parseInt(pm.left));
      "" != pm.top && (top = parseInt(pm.top));
      j_bg_img.css({ width: scWidth, height: scHeight, left: left, top: top });
      j_bg_img.attr("src", storage_url);
      $.setName(j_new_bg, pm.name);
      j_new_bg.find("img").remove();
      j_new_bg.append(j_bg_img);
      j_new_bg.css("display", "none");
      j_old_bg.after(j_new_bg);
      that.kag.ftag.hideNextImg();
      that.kag.layer.updateLayer("base", "fore", j_new_bg);
      "true" == pm.wait && that.kag.layer.hideEventLayer();
      pm.time = that.kag.cutTimeWithSkip(pm.time);
      "true" == pm.cross &&
        $.trans(pm.method, j_old_bg, parseInt(pm.time), "hide", function () {
          j_old_bg.remove();
        });
      $.trans(pm.method, j_new_bg, parseInt(pm.time), "show", function () {
        j_new_bg.css("opacity", 1);
        "false" == pm.cross && j_old_bg.remove();
        if ("true" == pm.wait) {
          that.kag.layer.showEventLayer();
          that.kag.ftag.nextOrder();
        }
      });
    });
    "false" == pm.wait && this.kag.ftag.nextOrder();
  },
};
tyrano.plugin.kag.tag.layermode = {
  vital: [],
  pm: {
    name: "",
    graphic: "",
    color: "",
    mode: "multiply",
    folder: "",
    opacity: "",
    time: "500",
    wait: "true",
  },
  start: function (pm) {
    this.kag.ftag.hideNextImg();
    var that = this,
      blend_layer = null;
    blend_layer = $(
      "<div class='layer_blend_mode blendlayer' style='display:none;position:absolute;width:100%;height:100%;z-index:99'></div>"
    );
    "" != pm.name && blend_layer.addClass("layer_blend_" + pm.name);
    "" != pm.color &&
      blend_layer.css("background-color", $.convertColor(pm.color));
    "" != pm.opacity &&
      blend_layer.css("opacity", $.convertOpacity(pm.opacity));
    "" != pm.folder ? (folder = pm.folder) : (folder = "image");
    var storage_url = "";
    if ("" != pm.graphic) {
      storage_url = "./data/" + folder + "/" + pm.graphic;
      blend_layer.css("background-image", "url(" + storage_url + ")");
    }
    blend_layer.css("mix-blend-mode", pm.mode);
    $("#tyrano_base").append(blend_layer);
    "" != pm.graphic
      ? this.kag.preload(storage_url, function () {
          blend_layer.fadeIn(parseInt(pm.time), function () {
            "true" == pm.wait && that.kag.ftag.nextOrder();
          });
        })
      : blend_layer.fadeIn(parseInt(pm.time), function () {
          "true" == pm.wait && that.kag.ftag.nextOrder();
        });
    "false" == pm.wait && this.kag.ftag.nextOrder();
  },
};
tyrano.plugin.kag.tag.layermode_movie = {
  vital: ["video"],
  pm: {
    name: "",
    mode: "multiply",
    opacity: "",
    time: "500",
    wait: "false",
    video: "",
    volume: "",
    loop: "true",
    mute: "false",
    speed: "",
    fit: "true",
    width: "",
    height: "",
    top: "",
    left: "",
    stop: "false",
  },
  start: function (pm) {
    this.kag.ftag.hideNextImg();
    var that = this,
      blend_layer = null,
      video = (blend_layer = $(
        "<video class='layer_blend_mode blendlayer blendvideo' data-video-name='" +
          pm.name +
          "' data-video-pm='' style='display:none;position:absolute;width:100%;height:100%;z-index:99' ></video>"
      )).get(0),
      url = "./data/video/" + pm.video;
    video.src = url;
    "" != pm.volume
      ? (video.volume = parseFloat(parseInt(pm.volume) / 100))
      : (video.volume = 0);
    "" != pm.speed && (video.defaultPlaybackRate = parseFloat(pm.speed));
    video.style.backgroundColor = "black";
    video.style.position = "absolute";
    video.style.top = "0px";
    video.style.left = "0px";
    video.style.width = "auto";
    video.style.height = "auto";
    "" != pm.width && (video.style.width = pm.width + "px");
    "" != pm.height
      ? (video.style.height = pm.height + "px")
      : "false" == pm.fit
      ? (video.style.height = "100%")
      : (video.style.height = "");
    "" != pm.left && (video.style.left = pm.left + "px");
    "" != pm.top && (video.style.top = pm.top + "px");
    video.style.minHeight = "100%";
    video.style.minWidth = "100%";
    video.style.backgroundSize = "cover";
    video.autoplay = !0;
    video.autobuffer = !0;
    video.setAttribute("playsinline", "1");
    "true" == pm.mute && (video.muted = !0);
    "true" == pm.loop ? (video.loop = !0) : (video.loop = !1);
    var j_video = $(video);
    video.addEventListener("ended", function (e) {
      "false" == pm.loop && j_video.remove();
      "true" == pm.wait && that.kag.ftag.nextOrder();
    });
    j_video.attr("data-video-pm", JSON.stringify(pm));
    j_video.hide();
    video.load();
    video.play();
    blend_layer = j_video;
    "" != pm.name && blend_layer.addClass("layer_blend_" + pm.name);
    "" != pm.opacity &&
      blend_layer.css("opacity", $.convertOpacity(pm.opacity));
    blend_layer.css("mix-blend-mode", pm.mode);
    $("#tyrano_base").append(blend_layer);
    blend_layer.fadeIn(parseInt(pm.time), function () {
      "true" == pm.wait &&
        "true" == pm.loop &&
        "true" != pm.stop &&
        that.kag.ftag.nextOrder();
    });
    "false" == pm.wait && "true" != pm.stop && this.kag.ftag.nextOrder();
  },
};
tyrano.plugin.kag.tag.free_layermode = {
  vital: [],
  pm: { name: "", time: "500", wait: "true" },
  start: function (pm) {
    this.kag.ftag.hideNextImg();
    var that = this,
      blend_layer = {},
      cnt = (blend_layer =
        "" != pm.name ? $(".layer_blend_" + pm.name) : $(".blendlayer")).length,
      n = 0;
    if (0 != cnt) {
      blend_layer.each(function () {
        var blend_obj = $(this);
        blend_obj.fadeOut(parseInt(pm.time), function () {
          blend_obj.remove();
          n++;
          "true" == pm.wait && cnt == n && that.kag.ftag.nextOrder();
        });
      });
      "false" == pm.wait && this.kag.ftag.nextOrder();
    } else that.kag.ftag.nextOrder();
  },
};
