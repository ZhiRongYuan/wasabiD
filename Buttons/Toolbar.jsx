/**
 * Created by wangzhiyong on
 * date:2016-04-05后开始独立改造
 * desc:按钮工具栏
 */
var React=require("react");
require("../Sass/Buttons/Toolbar.scss");
var LinkButton=require("./LinkButton.jsx");
var Button=require("./Button.jsx");
var SelectButton=require("./SelectButton.jsx");
var Toolbar=React.createClass({
    propTypes: {
        buttons:React.PropTypes.array.isRequired,
        type:React.PropTypes.oneOf([//主题
            "button",
            "link",
            "select",
            ""
            ]),
        buttonClick:React.PropTypes.func.isRequired,
        isButtonGroup:React.PropTypes.bool,//是否是按钮组  按钮连接在一起
    },
    getDefaultProps:function() {
        return{
            buttons:[],
            type:"",
            className:"",
            isButtonGroup:false,
        }
    },
    buttonClick:function(name,title,event) {
      this.props.buttonClick(name,title,event);//执行父组件的事件
    },
    SelectButtonClick:function (name,title,event,value,text,rowData) {
        this.props.buttonClick(name,title,event,value,text,rowData);//执行父组件的事件
    },
    renderButtonType(child,type){
        switch (type){
            case "button":
                return (
                    <Button key={child.name} {...child} onClick={this.buttonClick}>
                    </Button>
                )
                break;
            case "select":
                return (
                    <SelectButton key={child.name} {...child} onClick={this.SelectButtonClick}>
                    </SelectButton>
                )
                break;
            case "link":
                return (
                    <LinkButton key={child.name} {...child} onClick={this.buttonClick}>
                    </LinkButton>
                )
                break;
        }
    },
    render: function () {
        let props={
            className:this.props.className+" "+(this.props.isButtonGroup?"wasabi-toolbar-group ":"")+"wasabi-toolbar",
            style:this.props.style
        };
        var buttonlist = [];
        if (this.props.buttons != null) {
            this.props.buttons.map((child)=> {
                if(this.props.type){
                    buttonlist.push(this.renderButtonType(child,this.props.type));
                }else{
                    if(child.type){
                        buttonlist.push(this.renderButtonType(child,child.type));
                    }else{
                        console.warn("buttonModal构造器缺失type属性");
                    }
                }
            });
        }
        return (
            <div  {...props}>
                {buttonlist}
            </div>

        )
    }
});

module.exports=Toolbar;