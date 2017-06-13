/*
 create by jiaxuanliang
 modify by zhirongyuan
 date:2017-03-13后开始并入wasabiD组件库
 desc:操作按钮组
 */
require("../Sass/Buttons/ControlBar.scss");

var React = require("react");

var ControlBar = React.createClass({
    getInitialState:function(){
        return{
            slideHide:true,
            data:this.props.data,
            isClicked:false,
            sliderTop:0,
        }
    },
    handleOptClick:function(d,e){
        e.cancelBubble = true;
        this.props.handleSelect(d);
        this.setState({
            slideHide:true,
            isClicked:true
        });
    },
    showSlider:function(e){
        var targetTop=e.target.getBoundingClientRect().bottom;//操作按钮 距离顶部的距离

        this.refs.slide.style.display="block";
        var controlSlideHeight=this.refs.slide.offsetHeight;//按钮组的总高度
        this.refs.slide.style.display="none";

        var clientHeight=document.documentElement.clientHeight;//可视区高

        var sliderTop=0;
        if(targetTop+controlSlideHeight-clientHeight>-20){
            sliderTop=-controlSlideHeight+20;
        }

        if(!this.state.isClicked){
            this.setState({
                slideHide:false,
                sliderTop:sliderTop
            });
        }
    },
    hideSlider:function(e){
        this.setState({
            isClicked:false,
            slideHide:true
        });
    },
    componentWillReceiveProps:function(props){
        this.setState({
            data:props.data
        })
    },
    render:function (){
        if(!this.state.data){
            return null;
        }

        var data = this.state.data;
        if(data.length>2){
            var downClass = "controlBar-down",
                display = this.state.slideHide?"none":"block";

            return(
                <span className="controlBar-mutiWrap">
                    <a href="javascript:void(0)" className="controlBar-def" id="firstBtn" onClick={this.handleOptClick.bind(this,data[0])}>{data[0].title}</a>
                        <div className="enterWrap" onMouseEnter={this.showSlider} onMouseLeave={this.hideSlider}>
                            <a href="javascript:void(0)" className="controlBar-def">{data[1].title}</a>
                            <span className={downClass} ref="down"></span>
                            <ul className="controlBar-slider" ref="slide" style={{display:display,top:this.state.sliderTop}}>{
                                data.map(function(obj,index){
                                    if(index>0){
                                        return (
                                            <li key={"li"+index} onClick={this.handleOptClick.bind(this,obj)}>
                                                <a href="javascript:void(0)" className="controlBar-def" >{obj.title}</a>
                                            </li>
                                        );
                                    }
                                }.bind(this))
                            }</ul>
                        </div>

                </span>
            )
        }else{
            return(
                <span className="controlBar-mutiWrap">{
                    this.props.data.map(function(obj,index){
                        return (
                            <a href="javascript:void(0)" className="controlBar-def" key={"a"+index} onClick={this.handleOptClick.bind(this,obj)}>{obj.title}</a>
                        );
                    }.bind(this))
                }
                </span>
            );
        }
    }
});

module.exports = ControlBar;