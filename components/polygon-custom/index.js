// components/polygon/index.js

var context = null;
var canvasWidth = 0;
var canvasHeight = 0;
var TEXT_SPACE = 12;
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    areaColor: {
      type: String,
      value: "rgba(140,144,220,0.55)",
    },
    segmentLineColor: {
      type: String,
      value: "#d8d8d8",
    },
    diagonalLineColor: {
      type: String,
      value: "rgba(216,216,216,0.4)",
    },
    numberLineColor: {
      type: String,
      value: "rgba(140,144,220,0.3)",
    },
    axisTextColor: {
      type: String,
      value: "rgba(140,144,220,0.8)",
    },
    edgeNumber: {
      type: Number,
      value: 4,
    },
    textSize: {
      type: Number,
      value: 16,
    },
    textSpace: {
      type: Number,
      value: TEXT_SPACE,
    },
    polygons: {
      type: Array,
      value: [],
    },
    texts: {
      type: Array,
      value: [],
    },
  },

  /**
   * 组件的初始数据
   */
  data: {},

  ready() {
    context = wx.createCanvasContext("polygon", this);

    var that = this;
    const obj = this.createSelectorQuery();
    obj.select("#polygon").boundingClientRect();
    obj.exec(function (rect) {
      canvasWidth = rect[0].width;
      canvasHeight = rect[0].height;
      that.run();
    });
  },

  /**
   * 组件的方法列表
   */
  methods: {
    run() {
      if (this.properties.polygons.length < 3) {
        return;
      }
      if (this.properties.texts.length < this.properties.polygons.length) {
        for (
          let i = this.properties.polygons.length;
          i >= this.properties.texts.length;
          i--
        ) {
          this.properties.texts.push("空");
        }
      }
      var center_x = canvasWidth / 2;
      var center_y = canvasHeight / 2;
      var radius =
        ((canvasWidth > canvasHeight ? canvasHeight : canvasWidth) -
          2 * this.properties.textSpace -
          this.properties.textSize * 2) /
        2;
      var innerAngle = 360 / this.properties.polygons.length;

      this.drawSegmentLine(context, center_x, center_y, radius, innerAngle);
      this.drawDiagonalLine(context, center_x, center_y, radius, innerAngle);
      this.drawNumberLine(context, center_x, center_y, radius, innerAngle);
      this.drawAxisText(context, center_x, center_y, radius, innerAngle);
      this.drawShadowArea(context, center_x, center_y, radius, innerAngle);
      context.draw();
    },
    drawShadowArea(context, center_x, center_y, radius, innerAngle) {
      //画雷达图
      context.setFillStyle(this.properties.areaColor);
      context.setStrokeStyle(this.properties.segmentLineColor);
      context.setLineWidth(1);
      context.beginPath();

      for (let i = 0; i < this.properties.polygons.length; i++) {
        var f = this.properties.polygons[i];
        if (f > 1) {
          f = 1;
        }
        if (f < 0) {
          f = 0;
        }
        var currentRadius = radius * f;

        var x =
          center_x -
          Math.cos(this.angleToRadian(90 - innerAngle * i)) * currentRadius;
        var y =
          center_y -
          Math.sin(this.angleToRadian(90 - innerAngle * i)) * currentRadius;
        if (currentRadius !== 0) {
          context.lineTo(x, y);
        }
      }
      context.closePath();
      context.fill();
    },
    drawSegmentLine(context, center_x, center_y, radius, innerAngle) {
      //画分割线
      context.setStrokeStyle(this.properties.segmentLineColor);
      for (let i = 0; i <= this.properties.edgeNumber; i++) {
        context.setLineWidth(1);
        context.beginPath();
        for (let j = 0; j < this.properties.polygons.length; j++) {
          var x =
            center_x -
            Math.cos(this.angleToRadian(90 - innerAngle * j)) *
              ((radius * i) / this.properties.edgeNumber);
          var y =
            center_y -
            Math.sin(this.angleToRadian(90 - innerAngle * j)) *
              ((radius * i) / this.properties.edgeNumber);
          context.lineTo(x, y);
        }
        context.closePath();
        context.stroke();
      }
    },
    drawNumberLine(context, center_x, center_y, radius, innerAngle) {
      for (let j = 0; j < this.properties.polygons.length; j++) {
        context.setStrokeStyle(this.properties.numberLineColor);
        if (this.properties.polygons[j]) {
          let temp_x =
            center_x -
            Math.cos(this.angleToRadian(90 - innerAngle * j)) *
              this.properties.polygons[j] *
              radius;
          let temp_y =
            center_y -
            Math.sin(this.angleToRadian(90 - innerAngle * j)) *
              this.properties.polygons[j] *
              radius;
          context.beginPath();
          context.moveTo(center_x, center_y);
          context.lineTo(temp_x, temp_y);
          context.closePath();
          context.stroke();
          //画小圆形
          context.setFillStyle("#d5d6f0");
          context.beginPath();
          context.arc(temp_x, temp_y, 2, 0, 2 * Math.PI);
          context.closePath();
          context.fill();
          //写数值
          var text_size = 10
          var text_x =
            center_x -
            Math.cos(this.angleToRadian(90 - innerAngle * j)) *
              (this.properties.polygons[j] * radius +
                text_size / 2);
          var text_y =
            center_y -
            Math.sin(this.angleToRadian(90 - innerAngle * j)) *
              (this.properties.polygons[j] * radius +
                this.properties.textSize / 2);
          context.beginPath();
          context.setFontSize(text_size); // 字体大小 注意不要加引号
          context.setFillStyle(this.properties.axisTextColor); // 字体颜色
          context.setTextAlign("center"); // 字体位置
          context.setTextBaseline("middle"); // 字体对齐方式
          context.fillText(Math.floor(this.properties.polygons[j]*100)+"%", text_x, text_y); // 文字内容和文字坐标
          context.closePath();
        }
      }
    },
    drawDiagonalLine(context, center_x, center_y, radius, innerAngle) {
      //画对角线
      context.setStrokeStyle(this.properties.diagonalLineColor);
      context.setLineWidth(0.5);
      for (let j = 0; j < this.properties.polygons.length; j++) {
        context.setLineDash([2, 6]);
        context.beginPath();
        context.lineTo(center_x, center_y);
        var x =
          center_x - Math.cos(this.angleToRadian(90 - innerAngle * j)) * radius;
        var y =
          center_y - Math.sin(this.angleToRadian(90 - innerAngle * j)) * radius;
        context.lineTo(x, y);
        context.closePath();
        context.stroke();
      }
      context.setLineDash([]);
    },
    drawAxisText(context, center_x, center_y, radius, innerAngle) {
      //写文字
      for (let j = 0; j < this.properties.texts.length; j++) {
        let text = this.properties.texts[j];
        context.lineTo(center_x, center_y);
        var x =
          center_x -
          Math.cos(this.angleToRadian(90 - innerAngle * j)) *
            (radius + this.properties.textSpace + this.properties.textSize / 2);
        var y =
          center_y -
          Math.sin(this.angleToRadian(90 - innerAngle * j)) *
            (radius + this.properties.textSpace + this.properties.textSize / 2);
        context.beginPath();
        context.setFontSize(14); // 字体大小 注意不要加引号
        context.setFillStyle(this.properties.axisTextColor); // 字体颜色
        context.setTextAlign("center"); // 字体位置
        context.setTextBaseline("middle"); // 字体对齐方式
        context.fillText(text, x, y); // 文字内容和文字坐标
      }
    },
    angleToRadian(angle) {
      return ((2 * Math.PI) / 360) * angle;
    },
  },
});
