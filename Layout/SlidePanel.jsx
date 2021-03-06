/*
滑动面板
create by wangzy
date:2016-04-05
desc:滑动面板
*/
let React=require("react");
require("../Sass/Layout/SlidePanel.scss");
var Toolbar=require("../Buttons/Toolbar.jsx");
var Button=require("../Buttons/Button.jsx");
class SlidePanel extends  React.Component{
    constructor(props) {
        super(props);
        this.state={
            panelwidth:0,//总宽度
            containerwidth:0,//容器宽度
            leftwidth:0,//左侧滑块宽度
            rightwidth:0,//右侧内容宽度
            overlayOpacity:0,//遮盖层透明度
        }
        this.slideHandler=this.slideHandler.bind(this);
        this.buttonClick=this.buttonClick.bind(this);

    }
    static propTypes= {
        title: React.PropTypes.string,//标题
        width:React.PropTypes.number,//自定义宽度
        buttons: React.PropTypes.array,//自定义按钮
        buttonClick: React.PropTypes.func,//按钮的单击事件,
    }
    static defaultProps={
        title:"",
        width:document.body.clientWidth,
        buttons:[],
        buttonClick:null,
        url:null
    }

     open() {//打开事件，用于外部调用
       this.slideHandler();
   }
    close() {//关闭事件,用于外部调用
        this.slideHandler();
    }
    slideHandler() {
        if(this.state.panelwidth!=0)
        {//关闭时，外面宽度等过渡效果完成后再设置
            this.refs.slidebody.scrollTop = 0;
            this.setState({
                containerwidth: this.state.containerwidth == 0 ? this.props.width - 34 : 0,
                overlayOpacity:this.state.overlayOpacity==0?0.5:0
            });
            setTimeout(()=>{
                this.setState({
                    panelwidth:0
                })
            },700);//过渡效果结束后立即关闭
        }
       else
        {//打开时，立即将外面宽度设置
            this.setState({
                containerwidth: this.state.containerwidth == 0 ? this.props.width - 34 : 0,
                overlayOpacity:this.state.overlayOpacity==0?0.5:0,
                panelwidth:this.props.width
            });
        }

    }
    buttonClick(name,title) {
        if (this.props.buttonClick != null) {
            this.props.buttonClick(name, title);
        }
    }
    render() {
            return <div className={"wasabi-slidepanel "}  style={{width:this.state.panelwidth}}>
                <div className="slide-overlay" style={{width:this.state.panelwidth,opacity:this.state.overlayOpacity}}></div>
                <div className="slide-container" style={{width:this.state.containerwidth}}>

                        <div className="slide-header">
                            <div className="title">{this.props.title}</div>


                        </div>
                        <div className="slide-body" ref='slidebody'>
                            {
                                this.props.children
                            }

                        </div>
                    <div className="slide-footer">

                            <div className="slide-toolbar"><Toolbar type="button" buttons={this.props.buttons} buttonClick={this.buttonClick}></Toolbar></div>
                        <div className="slide-close">
                            <Button name="close" title="取消" theme="cancel" onClick={this.slideHandler}></Button>
                        </div>


                    </div>
                </div>
            </div>
        }
    };
module.exports=SlidePanel;