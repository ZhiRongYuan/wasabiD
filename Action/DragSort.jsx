/**
 * Created by zhirongyuan on 17/3/2.
 * desc:拖拽排序
 */
require("../sass/Action/dragSort.css");
var React =require( "react");
var Label=require("../Unit/Label.jsx");
let unit=require("../libs/unit.js");
var FetchModel=require("../Model/FetchModel.js");
var Message=require("../Unit/Message.jsx");
var showUpdate=require("../Mixins/showUpdate.js");

var DragSort=React.createClass({
    mixins:[showUpdate],
    PropTypes:{
        data:React.PropTypes.array,//拖拽排序组 的所有数据
        width:React.PropTypes.number,//组件 容器宽度
        wrapClassName:React.PropTypes.string,
        itemClassName:React.PropTypes.string,
        label:React.PropTypes.oneOfType([React.PropTypes.string,React.PropTypes.element,React.PropTypes.node]),//字段文字说明属性
        value:React.PropTypes.oneOfType([React.PropTypes.number,React.PropTypes.string]),//默认值
        url:React.PropTypes.string,//ajax的后台地址
        params:React.PropTypes.object,//查询参数
        dataSource:React.PropTypes.string,//ajax的返回的数据源中哪个属性作为数据源,为null时直接后台返回的数据作为数据源
        valueField: React.PropTypes.string,//数据字段值名称
        textField:React.PropTypes.string,//数据字段文本名称
        hide:React.PropTypes.bool,//是否隐藏
        sortIcon:React.PropTypes.bool,//是否需要显示排序的icon图标 例如:显示>>
        dropEnd:React.PropTypes.func,//拖拽结束后回调函数
        onClick:React.PropTypes.func,//点击事件
        draggable:React.PropTypes.bool,//是否允许排序
    },
    getDefaultProps(){
        return{
            data:[],
            width:"auto",
            dataSource:"data",
            valueField:"value",
            textField:"text",
            hide:false,
            sortIcon:true,
            draggable:true,
            params:null,
            value:"",
        }
    },
    getInitialState(){
        var newData=[];
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
            data:newData,
            hide:this.props.hide,
            activeIndex:null,
            params:unit.clone(this.props.params),//参数
            url:this.props.url,
            value:this.props.value,
        }
    },
    clearActiveIndex(){//清除当前点击的index  清除avtive样式
        this.setState({
            activeIndex:null,
        })
    },
    reload(url){
        this.loadData(url,this.state.params);//查询数据
    },
    componentWillMount:function() {//如果指定url,先查询数据再绑定
        this.loadData(this.state.url,this.state.params);//查询数据
    },
    componentWillReceiveProps(nextProps){
        var newData = null;
        if(nextProps.data!=null&&nextProps.data instanceof  Array &&(!nextProps.url||nextProps.url=="")) {//没有url,传的是死数据
            newData=[];
            //因为这里统一将数据进行了改造,所以这里要重新处理一下
            for (let i = 0; i < nextProps.data.length; i++) {
                let obj = nextProps.data[i];
                obj.text = nextProps.data[i][this.props.textField];
                obj.value = nextProps.data[i][this.props.valueField];
                newData.push(obj);
            }
        }
        else {//url形式
            newData = this.state.data;//先得到以前的数据
           if(this.state.url!=nextProps.url){
               this.loadData(nextProps.url, nextProps.params);//异步更新
           }
        }
        this.setState({
            data:this.setValue(nextProps.value,newData),
            hide:nextProps.hide,
            value:nextProps.value,
        })
    },
    setValue(value,data){
        var sortData=[];
        if(value){//是否有value值  有的话 根据value对数据进行排序 显示
            var valueArray=value.split(",");
            for(var i=0;i<valueArray.length;i++){
                for(var j=0;j<data.length;j++){
                    if(valueArray[i]==data[j][this.props.valueField]){
                        sortData.push(data[j]);
                    }
                }
            }
        }else{
            sortData=data;
        };
        return sortData;
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
        var newData=[];
       if(realData instanceof Array && realData.length>0){
           for(let i=0;i<realData.length;i++)
           {
               let obj=realData[i];//将所有字段添加进来
               obj.text=realData[i][this.props.textField];
               obj.value=realData[i][this.props.valueField];
               newData.push(obj);
           }
       }
        this.setState({
            data:this.setValue(this.state.value,newData),
        })
    },
    loadError:function(errorCode,message) {//查询失败
        console.log("select-error",errorCode,message);
        Message. error(message);
    },
    getByClass(sClass){//通过class 选择元素
        var aResult=[];
        var aEle=document.getElementsByTagName('*');

        for(var i=0;i<aEle.length;i++){
            /*将每个className拆分*/
            var arr=aEle[i].className.split(/\s+/);
            for(var j=0;j<arr.length;j++){
                /*判断拆分后的数组中有没有满足的class*/
                if(arr[j]==sClass){
                    aResult.push(aEle[i]);
                }
            }
        }
        return aResult;
    },
    domdrugstart(index,e) {
        this.dragStartIndex=index;//记录最开始拖拽元素对应的下标值
    },
    domdrugenter(index,e) {
        var newData=this.state.data;
        var allItme=this.getByClass("drag-item");
        for (var i=0;i<allItme.length;i++){
            allItme[i].classList.remove('over');
            allItme[i].style.opacity = '1';
        }
        e.target.classList.add('over');
        if(this.dragStartIndex==index){}else{
            var dragItem=newData.splice(this.dragStartIndex,1)[0];
            newData.splice(index,0,dragItem);
        }
        this.dragStartIndex=index;//重新设置 拖拽元素对应的下标值
        this.setState({
            data:newData,
        });
    },
    domdrugover(e) {
        if (e.preventDefault) {
            e.preventDefault();
        }
        return false;
    },
    domdrugleave(e) {
        e.target.classList.remove('over');
    },
    domdrop(index,e) {
        if (e.stopPropagation) {
            e.stopPropagation();
        }
        return false;
    },
    domdrapend(e) {
        var allItme=this.getByClass("drag-item");
        for (var i=0;i<allItme.length;i++){
            allItme[i].classList.remove('over');
            allItme[i].style.opacity = '1';
        };
        this.props.dropEnd&&this.props.dropEnd(this.state.data);
    },
    iconRender(boolValue){
        return boolValue?<i className="icon">>></i>:null
    },
    getDragSortData(){//form表单中  通过调用此方法 返回当前最新的排序数据(value值)
      return   this.getDragSort("value");//后台要求返回字符串
    },
    getDragSortTextData(){//form表单中  通过调用此方法 返回当前最新的排序数据(text值)
        return   this.getDragSort("text");//后台要求返回字符串
    },
    getDragSort(type){//form表单中  通过调用此方法 返回当前最新的排序数据(text值)
        var newData=this.state.data;
        var valueArray=[];
        if(type=="text"){
            for(var i=0;i<newData.length;i++){
                valueArray.push(newData[i].text);
            }
        }else if(type=="value"){
            for(var i=0;i<newData.length;i++){
                valueArray.push(newData[i].value);
            }
        }else{
            console.warn("只能传value或text")
        }
        return   valueArray.join();//后台要求返回字符串
    },
    onClickHandler(index){//点击事件
        if(this.props.onClick){//允许点击
            this.setState({
                activeIndex:index,
            })
        }
        this.props.onClick&&this.props.onClick(this.state.data,index);
    },
    render(){

        return (
            <div style={{display:this.state.hide?"none":"block"}}>
                <Label name={this.props.label}></Label>
                <ul className={"drag-wrap "+this.props.wrapClassName} id="dragWrap" style={{width:this.props.width}}>
                    {
                        this.state.data.map((item,index)=>{
                            var liClassName=(index==this.state.activeIndex)?"drag-item drag-item-active ":"drag-item ";
                            return (
                                <li key={index}
                                    className={liClassName+this.props.itemClassName}
                                    draggable={this.props.draggable}
                                    onDragStart={this.domdrugstart.bind(this,index,item.name)}
                                    onDragEnter={this.domdrugenter.bind(this,index)}
                                    onDragOver={this.domdrugover}
                                    onDragLeave={this.domdrugleave}
                                    onDrop={this.domdrop.bind(this,index)}
                                    onDragEnd={this.domdrapend}
                                    onClick={this.onClickHandler.bind(this,index)}
                                    style={{width:this.props.itemWidth,cursor:this.props.draggable?"move":"default"}}>
                                    {item[this.props.textField]}
                                    {this.iconRender(this.props.sortIcon?(this.state.data.length-1==index?false:true):false)}
                                </li>
                            )
                        })
                    }
                </ul>
            </div>
        )
    },
});

module.exports=DragSort;