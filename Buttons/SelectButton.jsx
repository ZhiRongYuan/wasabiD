/*
 create by zhirongyuan
 date:2017-03-22
 desc:下拉按钮组件
 */
require("../Sass/Buttons/SelectButton.scss");
var React=require("react");
var Button=require("./Button.jsx");
var Message=require("../Unit/Message.jsx");
let unit=require("../libs/unit.js");
var ClickAway=require("../Unit/ClickAway.js");
var FetchModel=require("../Model/FetchModel.js");
var showUpdate=require("../Mixins/showUpdate.js");
let  SelectButton  = React.createClass({
    mixins:[showUpdate],
    propTypes: {
        name: React.PropTypes.string,//名称
        title: React.PropTypes.string,//标题
        data:React.PropTypes.array,//自定义数据源
        valueField: React.PropTypes.string,//数据字段值名称
        textField:React.PropTypes.string,//数据字段文本名称
        url:React.PropTypes.string,//ajax的后台地址
        dataSource:React.PropTypes.string,//ajax的返回的数据源中哪个属性作为数据源,为null时直接后台返回的数据作为数据源
        theme: React.PropTypes.oneOf([//主题
            "primary",
            "default",
            "success",
            "info",
            "warning",
            "danger",
            "green",
            "cancel",
            "solid"
        ]),
        disabled: React.PropTypes.bool,//按钮是否无效
        className: React.PropTypes.string,//按钮自定义样式
    },
    getDefaultProps:function() {
        return{
            name:"",//关联值
            title:"",//标题
            data:null,
            valueField:"value",
            textField:"text",
            url:null,
            dataSource:"data",
            theme:"solid",
            disabled:false,
            className:"",
        }
    },
    getInitialState: function () {
        var newData=[];var text=this.props.text;
        if(this.props.data&&this.props.data instanceof  Array)
        {
            for(let i=0;i<this.props.data.length;i++)
            {
                let obj=this.props.data[i];
                obj.text=this.props.data[i][this.props.textField];
                obj.value=this.props.data[i][this.props.valueField];
                newData.push(obj);
            }
        }
        return {
            title:this.props.title,
            data:newData,
            hide:true,
            theme:this.props.theme,
            disabled:this.props.disabled,
        }
    },
    componentWillReceiveProps: function (nextProps) {
        var newData = null;
        if(nextProps.data!=null&&nextProps.data instanceof  Array &&(!this.props.url||this.props.url=="")) {//没有url,传的是死数据
            newData=[];
            //因为这里统一将数据进行了改造,所以这里要重新处理一下
            for (let i = 0; i < nextProps.data.length; i++) {
                let obj = nextProps.data[i];
                obj.text = nextProps.data[i][this.props.textField];
                obj.value = nextProps.data[i][this.props.valueField];
                if (obj.value == nextProps.value) {
                    text = obj.text;//根据value赋值
                }
                newData.push(obj);
            }
        }
        else {//url形式
            newData = this.state.data;//先得到以前的数据
            if (this.showUpdate(nextProps.params)) {//如果不相同则更新
                this.loadData(this.props.url, nextProps.params);//异步更新
            }
        }
        this.setState({
            data:newData,
            title: (nextProps.title)? nextProps.title:this.state.title,
            theme:nextProps.theme,
            disabled:nextProps.disabled
        })
    },
    componentWillMount:function() {//如果指定url,先查询数据再绑定
        this.loadData(this.props.url,this.state.params);//查询数据
    },
    toggleShow(name,title,event){
        if(this.state.data instanceof Array&&this.state.data.length==0){
            Message.alert("列表无任何数据显示");
            return false;
        }
        if(this.state.hide){
            document.addEventListener("click",this.docClickHandle,false);
        }
        event.stopPropagation();
        if (event.nativeEvent.stopImmediatePropagation) {//阻止冒泡
            event.nativeEvent.stopImmediatePropagation();
        }
        this.setState({
            hide:!this.state.hide,
        });
    },
    docClickHandle:function(e){
        this.setState({
            hide:true
        })
        document.removeEventListener("click",this.docClickHandle,false);
    },
    componentDidUpdate(){
        var target=this.refs.selectPanel;
        var tarClientRect = target.getBoundingClientRect();
        if(tarClientRect.left<0){
            target.style.left=0;
            target.style.marginLeft=0;
        }else if(tarClientRect.right>document.body.clientWidth){
            target.style.left="auto";
            target.style.right=0;
            target.style.marginLeft=0;
        }
    },
    loadData:function(url,params) {
        if(url!=null&&url!="")
        {
            if(params==null)
            {
                var fetchmodel=new FetchModel(url,this.loadSuccess,null,this.loadError);
                unit.fetch.get(fetchmodel);
            }
            else
            {
                var fetchmodel=new FetchModel(url,this.loadSuccess,params,this.loadError);
                unit.fetch.post(fetchmodel);
            }
        }
    },
    loadSuccess:function(data) {//数据加载成功
        var realData=data;
        if(this.props.dataSource==null) {
        }
        else {
            realData=unit.getSource(data,this.props.dataSource);
        }
        var newData=[];var text=this.state.text;
        for(let i=0;i<realData.length;i++)
        {
            let obj=realData[i];//将所有字段添加进来
            obj.text=realData[i][this.props.textField];
            obj.value=realData[i][this.props.valueField];
            if(obj.value==this.state.value)
            {
                text=obj.text;//根据value赋值
            }
            newData.push(obj);
        }
        if(this.props.extraData==null||this.props.extraData.length==0)
        {
            //没有额外的数据
        }
        else
        {
            //有额外的数据
            for(let i=0;i<this.props.extraData.length;i++)
            {
                let obj={};
                obj.text=this.props.extraData[i][this.props.textField];
                obj.value=this.props.extraData[i][this.props.valueField];
                if(obj.value==this.state.value)
                {
                    text=obj.text;//根据value赋值
                }
                newData.unshift(obj);
            }
        }
        this.setState({
            data:newData,
        })
    },
    loadError:function(errorCode,message) {//查询失败
        console.log("select-error",errorCode,message);
        Message. error(message);
    },
    onSelect(value,text,rowData,event){//下拉项  点击事件
        //ClickAway.unbindClickAway();//卸载全局单击事件
        if(value==undefined)
        {
            console.error("绑定的valueField没有")
        }
        if(text==undefined)
        {
            console.error("绑定的textField没有");
        }
        var newvalue = value;
        this.props.onClick&&this.props.onClick(this.props.name,this.state.title,event,value,text,rowData);
        this.setState({
            hide:true,
            value:newvalue,//将最后选中的项  标出来
        });
    },
    render(){
        var title=<span>{this.state.title}<i className="icon-drop"></i></span>
        return (
            <div className="wasabiD-selectButton">
                <Button theme={this.state.theme}
                        name={this.props.name}
                        disabled={this.state.disabled}
                        onClick={this.toggleShow}
                        className={this.props.className}
                        title={title}
                        ref="button"
                />
                <ul className="selectPanel" ref="selectPanel" style={{display:this.state.hide?"none":"block"}}>
                    {
                        this.state.data.map((child, i)=> {
                            return (
                                <li key={"li" + i} className={child.value == this.state.value ? "active" : ""}
                                    onClick={this.onSelect.bind(this, child.value, child.text, child)}>{child.text}</li>
                            )
                        })
                    }
                </ul>
            </div>
        )
    }
});
module.exports=SelectButton;