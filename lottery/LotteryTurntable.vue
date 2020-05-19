<template>
  <div class="banner">
    <div class="turntable-box" ref="turntablebox" :style="{height: boxHeight + 'px'}">
      <canvas class="item needsclick" ref="turntablecanvas"></canvas>
      <div class="spinButton" @click="startTurntable">
        <img id="spinBtn" :src="disabled?spinGreySrc:spinSrc"/>
      </div>
    </div>
  </div>
</template>
<style scoped>
  .banner {
    display: block;
    margin: 0 auto;
    padding: 8px;
    border-radius: 50%;
    background: #fff0c8;
    box-sizing: border-box;
  }

  .banner .turntable-box {
    display: block;
    position: relative;
    margin: 0 auto;
  }

  .banner .turntable-box canvas {
    width: 100%;
    height: 100%;
    transform: translateZ(0);
    -webkit-font-smoothing: antialiased;
    perspective: 1px;
    -moz-osx-font-smoothing: grayscale;
    touch-action: none;
  }

  .banner .turntable-box .spinButton {
    position: absolute;
    display: inline-block;
    width: 80px;
    height: 100px;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -60%);
    color: #fff;
    font-size: 24px;
    vertical-align: middle;
    text-align: center;
  }

  .banner .turntable-box .spinButton img {
    width: 100%;
    height: 100%;
    z-index: -1;
  }

  .banner .turntable-box .spinButton:after {
    content: 'SPIN';
    display: inline-block;
    position: absolute;
    top: 60%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

</style>
<script>
  import LotteryDial from './dial'
  import * as pixelRatio from './modules/pixelRatio'
  import spinSrc from 'assets/lucky/needle.png'
  import spinGreySrc from 'assets/lucky/needle_grey.png'
  import couponSrc from 'assets/lucky/coupon.png'
  import goodLuckSrc from 'assets/lucky/good_luck.png'
  import physicalGoods from 'assets/lucky/gift.png'
  export default {
    data() {
      return {
        spinSrc,
        spinGreySrc,
        boxHeight: 0,
        turnableOptions: {
          width: 0,
          height: 0,
          centerX: 0,
          centerY: 0,
          radius: 0,
          textRadius: 24,
          innerMargin: 16,
          fontCololr: '#97A6C5',
          fontSize: 9,
          fontFamily: '',
          lineWidth: 3,
          circleRadius: 5,
          circleNumber: 24,
          //开始角度
          startAngle: 270,
        }
      }
    },

    props: {
      awards: {
        type: Array,
        default: ()=>[]
      },
      disabled: {
        type: Boolean,
        default: true
      }

    },


    computed: {
      oldrestaraunts() {
        return this.awards.reverse()
      }
    },

    mounted() {
      this.boxHeight = this.getElementWidth(this.$refs.turntablebox);
      this.$refs.turntablecanvas.width = this.boxHeight;
      this.$refs.turntablecanvas.height = this.boxHeight;
      this.createTurntable();
      this.drawTurntable();
    },
    methods: {
      getRadian(x) {
        return Math.PI * x / 180;
      },
      getElementWidth(el) {
        return window.getComputedStyle(el).width.split('px')[0];
      },
      getCanvasLinearGradient(ctx) {
        var fillColorLG = ctx.createLinearGradient(0, 0, 0, this.turnableOptions.width);
        fillColorLG.addColorStop(0, '#FB886A');
        fillColorLG.addColorStop(1, "#FB597D");
        return fillColorLG;
      },
      drawTurntable() {
        var canvas = this.$refs.turntablecanvas;
        if (!canvas.getContext) {
          return;
        }
        var ctx = canvas.getContext('2d');

        var width = canvas.width;
        this.turnableOptions.width = width;
        this.turnableOptions.height = width;
        this.turnableOptions.centerX = width / 2;
        this.turnableOptions.centerY = width / 2;
        this.turnableOptions.radius = width / 2;

        pixelRatio.canvasBlurryPolyfill(ctx, canvas);

        ctx.beginPath();
        ctx.arc(this.turnableOptions.centerX, this.turnableOptions.centerY, this.turnableOptions.radius, 0, 2 * Math.PI)
        ctx.fillStyle = this.getCanvasLinearGradient(ctx);

        ctx.fill();
        ctx.save();

        this.drawSmallCircle(ctx);
        this.drawTurnableSector(ctx);
      },
      /**
       * 从right位置逆时针绘制24个小圆，每相隔两个为亮色，中间为暗色
       */
      drawSmallCircle(ctx) {
        var smallCircleNumber = this.turnableOptions.circleNumber;
        var lightCircleRadius = this.turnableOptions.circleRadius;
        var lightCircleColor = '#ffffff';

        var darkCircleRadius = lightCircleRadius - 1;
        var darkCircleColor = '#ffafb5';

        var x = 0;
        while (x < smallCircleNumber) {
          var d = {
            radius: 0,
            color: '',
          }
          if (x % 3 == 0) {
            d.radius = lightCircleRadius;
            d.color = lightCircleColor;
          } else {
            d.radius = darkCircleRadius;
            d.color = darkCircleColor;
          }

          var angle = Math.PI / 12 * x;

          var bigRadius = this.turnableOptions.radius - this.turnableOptions.innerMargin / 2;
          var cx = this.turnableOptions.centerX + Math.cos(angle) * bigRadius;
          var cy = this.turnableOptions.centerY - Math.sin(angle) * bigRadius;

          ctx.beginPath();
          ctx.arc(cx, cy, d.radius, 0, 2 * Math.PI);
          ctx.fillStyle = d.color;
          ctx.fill();
          ctx.save();

          ++x;
        }
      },
      drawTurnableSector(ctx) {
          var sectorRadius = this.turnableOptions.radius - this.turnableOptions.innerMargin;

          var sectorNumber = this.awards.length;
          var cx = this.turnableOptions.centerX;
          var cy = this.turnableOptions.centerY;
          var angleUnit = (Math.PI * 2) / sectorNumber;
          // 绘制图形及扇形区域
          this.awards.forEach((item, x) => {
              ctx.beginPath();
              ctx.arc(cx, cy, sectorRadius, (angleUnit * x), (angleUnit * (x + 1)));
              ctx.fillStyle = x % 2 == 0 ? '#ffe9cc' : '#fff5f9';
              ctx.lineTo(this.turnableOptions.centerX, this.turnableOptions.centerY);
              ctx.closePath();
              ctx.fill();
              ctx.save();
          });
          // 绘制文字
          this.awards.forEach((item, x) => {
              var textOuterRadius = this.turnableOptions.radius - this.turnableOptions.innerMargin
              var startAngle = angleUnit * x;
              var endAngle = angleUnit * (x + 1);

              ctx.beginPath();
              ctx.arc(cx, cy, sectorRadius, startAngle, endAngle, false);
              ctx.arc(cx, cy, sectorRadius - this.turnableOptions.textRadius, endAngle, startAngle, true);
              ctx.fillStyle = '#e7f1ff';
              ctx.closePath();
              ctx.fill();
              ctx.save();

            var d = {
                ctx: ctx,
                radius: sectorRadius - this.turnableOptions.textRadius / 2,
                x: this.turnableOptions.centerX,
                y: this.turnableOptions.centerY,
                text: item.name,
                startAngle: startAngle + this.getRadian(5),
                endAngle: endAngle - this.getRadian(5),
            };

            this.drawCircularText(d, 'center');
          });

          this.awards.forEach((item, x) => {
              var startAngle = angleUnit * x;
              var endAngle = angleUnit * (x + 1);
              var imgSrc = item.image? item.image : physicalGoods;
              if(item.type == 0){
                imgSrc = goodLuckSrc;
              }
              else if(item.type == 2){
                imgSrc = couponSrc;
              }
            
              this.drawTurntableImage(ctx, endAngle, startAngle, sectorRadius - this.turnableOptions.textRadius, imgSrc);
          })
          //绘制线条
          this.awards.forEach((item, x) => {
            ctx.beginPath();
            ctx.moveTo(this.turnableOptions.centerX, this.turnableOptions.centerY);
            ctx.lineTo(this.turnableOptions.centerX + Math.cos(angleUnit * x) * sectorRadius, this.turnableOptions.centerX - Math.sin(angleUnit * x) * sectorRadius)
            ctx.lineWidth = this.turnableOptions.lineWidth;
            ctx.strokeStyle = this.getCanvasLinearGradient(ctx);
            ctx.stroke();
            ctx.save();
          })
      },
      drawCircularText({ctx, x, y, radius, text, startAngle, endAngle}, lv) {
        ctx.save();
        ctx.fillStyle = this.turnableOptions.fontCololr;
        ctx.font = `${this.turnableOptions.fontSize}px ${this.turnableOptions.fontFamily}`;
        ctx.textAlign = lv;
        ctx.textBaseline = 'middle';
        // 计算文字与弧长之间的关系，自动识别是否需要换行
        // 弧长=弧度 *半径
        // 测量当前文字需要的弧度长度
        var outerRadius = this.turnableOptions.radius - this.turnableOptions.innerMargin;
        var attemptPlaceChar = function (text, radius, gapAngle) {
          var width = ctx.measureText(text).width;
          var textLen = text.length;

          // 避免直线宽段不够，因此在此总宽度乘以1.1
          width = width * 1.1;
          var singleCharWidth = width / textLen;
          var arcWidth = radius * gapAngle;
          var maxCharNumber = Math.floor(arcWidth / singleCharWidth);

          var newStr = text.substr(0, maxCharNumber + 1);
          var newWidth = ctx.measureText(newStr).width;
          while (arcWidth < newWidth) {
            newStr = text.substr(0, --maxCharNumber);
            newWidth = ctx.measureText(newStr).width;
          }
          var textLen = maxCharNumber > textLen ? textLen : maxCharNumber;
          var singleCharAngle = (1 / maxCharNumber) * gapAngle;
          return {
            arcWidth,
            singleCharAngle,
            singleCharWidth,
            maxCharNumber,
            width,
            radius,
            textLen,
            text
          }
        }
        var adaptTextArc = function (text, textRadius, startAngle, endAngle) {
          text = text.trim();
          var SPACE_CHAR = ' ';
          text = text.replace(/\s+/g, SPACE_CHAR);

          var gapAngle = endAngle - startAngle;
          var centerAngle = (endAngle + startAngle) / 2;
          var placeOptions = attemptPlaceChar(text, outerRadius - textRadius / 2, gapAngle);

          // 如果宽度小于幅度的宽度，说明可以直接展示当前文字
          if (placeOptions.width < placeOptions.arcWidth) {
            return [{
              angle: centerAngle - placeOptions.singleCharAngle * placeOptions.textLen / 2,
              ...placeOptions
          }]
          } else {
            // 尝试分词，按照空格、强制截断两种方式
            var lastSpaceIndex = text.lastIndexOf(SPACE_CHAR);
            if (lastSpaceIndex > 0) {
              // 区分成两部分
              var firstPlaceOptions = attemptPlaceChar(text.substr(0, lastSpaceIndex), outerRadius - textRadius / 4, gapAngle);
              if (firstPlaceOptions.width < firstPlaceOptions.arcWidth) {
                var secondPlaceOptions = attemptPlaceChar(text.substr(lastSpaceIndex + 1), outerRadius - textRadius * 3 / 4, gapAngle);
                if (secondPlaceOptions.width < secondPlaceOptions.arcWidth) {
                  return [{
                    ...firstPlaceOptions,
                    angle
                :
                  centerAngle - firstPlaceOptions.singleCharAngle * firstPlaceOptions.textLen / 2,
                },
                  {
                  ...
                    secondPlaceOptions,
                      angle
                  :
                    centerAngle - secondPlaceOptions.singleCharAngle * secondPlaceOptions.textLen / 2,
                  }
                ]
                }
              }
            }
            // 按照强制截断两种方式
            var firstStr = text.substr(0, placeOptions.textLen);
            var secondStr = text.substr(placeOptions.textLen)
            var firstOptions = attemptPlaceChar(firstStr, outerRadius - textRadius / 4, gapAngle);
            var secondOptions = attemptPlaceChar(secondStr, outerRadius - textRadius * 3 / 4, gapAngle);

            var result = [{
              ...firstOptions,
              angle
          :
            centerAngle - firstOptions.singleCharAngle * firstOptions.textLen / 2,
          },
            {
            ...
              secondOptions,
                angle
            :
              centerAngle - secondOptions.singleCharAngle * secondOptions.textLen / 2,
            }
          ]
            ;
            result[1].text = secondOptions.text.substr(0, secondOptions.textLen);
            return result;
          }
        };

        var drawLineText = function (ctx, x, y, {singleCharAngle, radius, angle, text}) {
          var index = 0;
          var character;
          var len = text.length;
          while (index < len) {
            character = text.charAt(index);

            ctx.save();
            ctx.beginPath();
            ctx.translate(x + Math.cos(angle) * radius,
              y + Math.sin(angle) * radius);
            ctx.rotate(Math.PI / 2 + angle);

            ctx.fillText(character, 0, 0);
            angle += singleCharAngle;
            index++;
            ctx.restore();
          }
        };

        var textOptionsList = adaptTextArc(text, this.turnableOptions.textRadius, startAngle, endAngle);
        textOptionsList.forEach((item) => {
          drawLineText(ctx, x, y, item);
        });
        ctx.restore();
      },
      drawTurntableImage(ctx, endAngle, startAngle, radius, imgSrc) {
        var imgNode = new Image();
        var turntableOptions = this.turnableOptions;
        imgNode.onload = function () {
          imgNode.onerror = null;
          imgNode.onload = null;
          var angle = (endAngle + startAngle) / 2;
          var devicedpr = pixelRatio.getDevicePixelRatio();
          var width = this.width;
          var height = this.height;

          var dWidth = width / devicedpr;
          var dHeight = height / devicedpr;
          var FIXED_LEN = 12 * devicedpr;
          if (width > height) {
            if (width > FIXED_LEN) {
              height = (FIXED_LEN / width) * height;
              width = FIXED_LEN;
            }
          } else {
            if (height > FIXED_LEN) {
              width = (FIXED_LEN / height) * width;
              height = FIXED_LEN;
            }
          }


          ctx.save();
          ctx.beginPath();
          ctx.translate(turntableOptions.centerX + Math.cos(angle) * radius,
            turntableOptions.centerY + Math.sin(angle) * radius);
          ctx.rotate(Math.PI / 2 + angle);
          ctx.drawImage(imgNode, -1 * width / 2, 10, width, height);
          ctx.restore();
        };
        imgNode.onerror = function () {
          imgNode.onerror = null;
          imgNode.onload = null;
        };
        imgNode.src = imgSrc;
      },
      createTurntable() {
        var turntableLottery = new LotteryDial(this.$refs.turntablecanvas, {
          speed: 30, // 每帧速度
          areaNumber: this.awards.length,
          pointerAngle: this.turnableOptions.startAngle,
        });

        turntableLottery.on('start', () => {
            this.$emit('turnResult', turntableLottery, this.awards)
        });

        turntableLottery.on('end', () => {
          var index = turntableLottery.getAwardsResult();
          this.$emit('turnEnd', this.awards[index - 1], index, this.awards);
        });

        this.turntableLottery = turntableLottery;
      },
      startTurntable() {
        if (!this.disabled) {
          this.turntableLottery.draw()
        } else {
          console.log('disabled lucky!');
        }
      },
    },
    components: {}
  }
</script>
