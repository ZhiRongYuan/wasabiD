//creete by zhirongyuan
//date:2017-05-27
//desc 输入一块块文字  回车或失去焦点为一个块
require("../sass/Form/TextBlock.scss");
let React=require("react");
var Label=require("../Unit/Label.jsx");
var Message=require("../Unit/Message.jsx");
var FetchModel=require("../Model/FetchModel.js");
var unit=require("../libs/unit.js");

var TextBlock=React.createClass({
    propTypes: {
        label:React.PropTypes.oneOfType([React.PropTypes.string,React.PropTypes.element,React.PropTypes.node]),//字段文字说明属性
    },
    getDefaultProps:function() {
        return{
            label:null,
        }
    },
    getInitialState:function() {
        return{
            value:[],
            inputValue:"",
        }
    },
    componentWillReceiveProps:function(nextProps) {
        this.setState({

        });

    },
    componentDidMount:function() {
        this.validateInput=true;//设置初始化值，输入有效
        this.onblur=false;
    },
    componentDidUpdate:function() {
        var clientHeight=this.refs.textBlockWrap.clientHeight;//滚动元素的可视高
        var scrollHeight=this.refs.textBlockWrap.scrollHeight;//滚动元素的内容高
        this.refs.textBlockWrap.scrollTop=scrollHeight-clientHeight;
    },
    changeHandler:function(event) {
        this.setState({
            inputValue:event.target.value,
        })
    },
    keyUpHandler:function(event) {
        if(event.keyCode==13)
        {
            var newValue=this.state.value;
            if(event.target.value){
                newValue.push(event.target.value);
            };
            this.refs.input.focus();
            this.setState({
                value:newValue,
                inputValue:"",
            })
        }

        if(this.props.onKeyUp!=null)
        {
            this.props.onKeyUp(event);
        }
    },
    blurHandler:function(event) {
        var newValue=this.state.value;
        if(event.target.value){
            newValue.push(event.target.value);
        }
        this.setState({
            value:newValue,
            inputValue:"",
        })
    },
    focusHandler:function () {
      this.refs.input.focus();
    },
    deleteLabel(index){
        var newValue=this.state.value.filter((item,i)=>{
            if(index!=i){
                return item;
            }
        });
        this.setState({
            value:newValue,
        })
    },
    getValue:function () {//获取值
        return this.state.value;
    },
    setValue:function (valueArr) {//获取值
        if(valueArr && valueArr instanceof Array){
            this.setState({
                value:valueArr
            });
        }
    },

    render:function() {
        return (<div className="wasabi-form-group">
                <Label name={this.props.label} ref="label" hide={this.state.hide} required={this.state.required}></Label>
                <div className="wasabi-form-group-body" style={{width:!this.props.label?"100%":null}}>
                    <div className="wasabi-form-textBlock" onClick={this.focusHandler} ref="textBlockWrap">
                        {
                            this.state.value.map((item,index)=>{
                                return <label key={"label"+index}>{item}<i className="icon-close" onClick={this.deleteLabel.bind(this,index)}></i></label>
                            })
                        }
                        <input ref="input" onChange={this.changeHandler} onBlur={this.blurHandler}  onKeyUp={this.keyUpHandler} value={this.state.inputValue}/>
                    </div>
                </div>
            </div>
        )
    }
});
module .exports=TextBlock;