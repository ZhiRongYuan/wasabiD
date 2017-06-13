let React=require("react");
require("../Sass/Unit/newToolTip.scss");
let ToolTip=React.createClass({
    propTypes:{
        theme:React.PropTypes.oneOf([
            "dark",
            "light",
        ]),//主题
        size:React.PropTypes.oneOf([
            "small",
            "medium",
            "large"
        ]),//大小
        direction:React.PropTypes.oneOf([
            "south",
            "west",
            "north",
            "east",
        ]),//方向
        iconCls:React.PropTypes.string,//图片
        color:React.PropTypes.string,//图片字体颜色
        content:React.PropTypes.any,//提示信息
    },
    getDefaultProps:function(){
        return{
           theme:"dark",
            size:"medium",
            direction:"west",
            iconCls:"icon-help",
            color:"#999",
            content:"",
        };
    },
    getInitialState :function(){
        return{
            hide:true,
            direction:this.props.direction
        };
    },
    showTipHandler:function(){
        this.setState({
            hide:false
        });
    },
    componentDidMount:function(){
        var toolTip = this.refs.tooltip;
        var target = this.refs.tipTarget;
        var tarClientRect = target.getBoundingClientRect();
        var tipClientRect=toolTip.getBoundingClientRect();
        var tipWidth = toolTip.offsetWidth;
        var tarWidth = target.offsetWidth;
        var tarLeft = target.offsetLeft;
        var tipLeft = tarLeft+((tarWidth-tipWidth)/2);

        if(tarClientRect.left+tipLeft<0){
            if(this.state.direction!="west"){
                tipLeft = 0;
                toolTip.style.left = tipLeft+5+"px";
            }
        }else if(tarClientRect.left+Math.abs((tarWidth-tipWidth)/2)>=document.body.clientWidth){
            if(this.state.direction!="west") {
                tipLeft = tarLeft + (tarWidth - tipWidth);
                toolTip.style.left = tipLeft+5+"px";
            }
        }
        //判断方向位置
    },
    hideTipHandler:function(event) {//鼠标移开时隐藏下拉
        this.setState({
            hide:true,
        })
    },
    render:function(){
        var className=this.props.theme+"-tooltip"+" "+this.props.theme+" "+this.props.size+" "+this.state.direction;
        var containerClassName = this.props.theme+"-tooltip "+ this.state.direction;
        var tipBodyClassName = "tip-body "+ this.props.theme+" "+ this.props.size;
        return (
            <div className="tooltip-div"
                 onMouseLeave={this.hideTipHandler}
                 style={this.props.style}>
                <div ref="tipTarget" className="tooltip-button" onClick={this.showTipHandler}>
                    {this.props.children}
                    <span className={"wasabiD-toolTip-icon "+this.props.iconCls}
                          onMouseOver={this.showTipHandler}
                          style={{color:this.props.color}}></span>
                </div>
                <div ref="tooltip" className={containerClassName} style={{display:(this.state.hide==true?"none":"block")}}>
                    <div className={tipBodyClassName}>{this.props.content}</div>
                </div>
            </div>
        );
    }
});
module .exports=ToolTip;