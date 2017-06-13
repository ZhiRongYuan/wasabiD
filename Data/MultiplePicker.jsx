let React=require("react");
require("../Sass/Data/MultiplePicker.scss");
let unit=require("../libs/unit.js");

let FetchModel=require("../Model/FetchModel.js");
let PickerModel=require("../Model/PickerModel.js");
let CheckBox=require("../Form/CheckBox.jsx");
var validation=require("../Lang/validation.js");
var Button=require("../Buttons/Button.jsx");
var Modal=require("../Layout/Modal.jsx");
let setStyle=require("../Mixins/setStyle.js");
var validate=require("../Mixins/validate.js");
var showUpdate=require("../Mixins/showUpdate.js");
var shouldComponentUpdate=require("../Mixins/shouldComponentUpdate.js");
var Label=require("../Unit/Label.jsx");
var Message=require("../Unit/Message.jsx");


var MultiplePicker=React.createClass({
    mixins:[showUpdate],
    propTypes: {
        width:React.PropTypes.number,//宽度
        height:React.PropTypes.number,//高度
        valueField:React.PropTypes.string,//数据字段值名称
        textField:React.PropTypes.string,//数据字段文本名称
        url:React.PropTypes.string,//ajax的后台地址
        classify:React.PropTypes.bool,//渲染的数据 是否需要分类处理(业务场景:如地址选择是否需要区分华南 华北 西南 西北...)
        params:React.PropTypes.object,//查询参数
        dataSource:React.PropTypes.string,//ajax的返回的数据源中哪个属性作为数据源,为null时直接后台返回的数据作为数据源
        data:React.PropTypes.array,//自定义数据源
        onSelect: React.PropTypes.func,//选中后的事件，回传，value,与text,data

        //其他属性
        secondUrl:React.PropTypes.string,//第二层节点的后台地址,
        secondParams:React.PropTypes.object,//第二层节点的后台参数
        secondParamsKey:React.PropTypes.string,//第二层节点的后台参数中传递一级节点value值的参数名称
        thirdUrl:React.PropTypes.string,//第三层节点的后台地址，
        thirdParams:React.PropTypes.object,//第三层节点的后台参数
        thirdParamsKey:React.PropTypes.string,//第三层节点的后台参数中传递二级节点value值的参数名称

        value:React.PropTypes.array,//组件第一层的初始值
        secondValue:React.PropTypes.array,//组件二层节点的初始值
        disabledValue:React.PropTypes.array,//组件第一层的不可操作的数据
        disabledSecondValue:React.PropTypes.array,//组件二层节点不可操作的数据

        okHandler:React.PropTypes.func,//确定 窗口 的回调事件
        addressListAttr:React.PropTypes.string,//如果classify为true时,分类下面的数据集合对应的属性名
    },
    getDefaultProps :function(){
        return {
            width:null,
            height:null,

            //其他属性
            valueField:"value",
            textField:"text",
            url:null,
            classify:false,
            params:null,
            dataSource:"data",
            data:null,
            onSelect:null,
            //其他属性
            secondUrl:null,
            secondParams:null,
            secondParamsKey:null,
            thirdUrl:null,
            thirdParams:null,
            thirdParamsKey:null,
            value:[],
            secondValue:[],
            disabledValue:[],
            disabledSecondValue:[],
            addressListAttr:"addressLirarys"
        }


    },
    getInitialState:function() {
        return {

            //其他属性
            params:unit.clone( this.props.params),
            provinceActiveIndex:null,//一级激活节点下标
            classIfyIndex:null,
            cityActiveIndex:null,//二级激活节点下标
            distinctActiveIndex:null,//三级激活节点下标
            //其他属性
            secondParams:this.props.secondParams,
            secondParamsKey:this.props.secondParamsKey,
            thirdParams:this.props.thirdParams,
            thirdParamsKey:this.props.thirdParamsKey,

            allChecked:false,//是否全选
            value:this.props.value,
            secondValue:this.props.secondValue,
            disabledValue:this.props.disabledValue,
            disabledSecondValue:this.props.disabledSecondValue,
        }
    },
    componentDidMount:function(){

        if(this.props.url!=null) {
            var fetchmodel=new FetchModel(this.props.url,this.loadfistLevelSuccess,this.state.params,this.loadError);
            unit.fetch.post(fetchmodel);
        }
    },
    componentWillReceiveProps:function(nextProps) {
        if(nextProps.data!=null&&nextProps.data instanceof  Array &&(!nextProps.url||nextProps.url=="")) {
            this.setState({
                data:nextProps.data,
                value:nextProps.value,
                secondValue:nextProps.secondValue,
                params:unit.clone( nextProps.params),
                secondParams:nextProps.secondParams,
                secondParamsKey:nextProps.secondParamsKey,
                thirdParams:nextProps.thirdParams,
                thirdParamsKey:nextProps.thirdParamsKey,
            })
        }
        else {

            var fetchmodel=new FetchModel(this.props.url,this.loadfistLevelSuccess,nextProps.params,this.loadError);
            unit.fetch.post(fetchmodel);
            this.setState({
                params:unit.clone(nextProps.params),
                secondParams:nextProps.secondParams,
                value:nextProps.value,
                secondValue:nextProps.secondValue,
                disabledValue:nextProps.disabledValue,
                disabledSecondValue:nextProps.disabledSecondValue,
                secondParamsKey:nextProps.secondParamsKey,
                thirdParams:nextProps.thirdParams,
                thirdParamsKey:nextProps.thirdParamsKey,
            })
        }
    },

    loadfistLevelSuccess:function(data) {//一级节点的数据加载成功
        let provinceData=[];//一级节点数据
        var realData=data;
        //获取真实数据
        if(this.props.dataSource==null) {
        }
        else {
            realData=unit.getSource(data,this.props.dataSource);
        }
        if(this.props.classify){//是否分类显示
            provinceData=realData;
            for(var i=0;i<provinceData.length;i++){
                provinceData[i].checked=false;//初始化为false  不选中addressLibraryList
                provinceData[i][this.props.addressListAttr]=this.setPickerModel(provinceData[i][this.props.addressListAttr])
            };

            if(this.state.value instanceof  Array && this.state.value.length>0){//初始化勾选显示的数据
                var value=[];
                for(var i=0;i<this.state.value.length;i++){
                    value.push(this.state.value[i].value);
                };

                for(var i=0;i<provinceData.length;i++){//组件传过来的 一级初始值 进行设置
                    for(var j=0;j<provinceData[i][this.props.addressListAttr].length;j++){
                        if(value.join().indexOf(provinceData[i][this.props.addressListAttr][j].value)>-1){
                            provinceData[i][this.props.addressListAttr][j].checked=true;
                        }else{
                            provinceData[i][this.props.addressListAttr][j].checked=false;
                        }
                    }
                };

                for(var i=0;i<provinceData.length;i++){
                    var isAllChecked=true;
                    for(var j=0;j<provinceData[i][this.props.addressListAttr].length;j++){
                        if( !provinceData[i][this.props.addressListAttr][j].checked){
                            isAllChecked=false;
                            break;
                        }
                    };
                    if(isAllChecked){
                        provinceData[i].checked=true;
                    }
                }
            }


            if(this.state.disabledValue instanceof  Array && this.state.disabledValue.length>0){
                var disabledValue=[];
                for(var i=0;i<this.state.disabledValue.length;i++){
                    disabledValue.push(this.state.disabledValue[i].value);
                };

                for(var i=0;i<provinceData.length;i++){//组件传过来的 一级初始值 进行设置
                    for(var j=0;j<provinceData[i][this.props.addressListAttr].length;j++){
                        if(disabledValue.join().indexOf(provinceData[i][this.props.addressListAttr][j].value)>-1){
                            provinceData[i][this.props.addressListAttr][j].disabled=true;
                        }else{
                            provinceData[i][this.props.addressListAttr][j].disabled=false;
                        }
                    }
                }
            }

            for(var i=0;i<provinceData.length;i++) {
                var classifyDisabled=false;
                for(var j=0;j<provinceData[i][this.props.addressListAttr].length;j++){
                    if(provinceData[i][this.props.addressListAttr][j].disabled){
                        classifyDisabled=true;
                        break;
                    }
                };
                provinceData[i].disabled=classifyDisabled;
            }



            for(var i=0;i<provinceData.length;i++){//组件传过来的 一级初始值 进行设置
                for(var j=0;j<provinceData[i][this.props.addressListAttr].length;j++){
                    for(var k=0;k<this.state.secondValue.length;k++){
                        if(this.state.secondValue[k].value==provinceData[i][this.props.addressListAttr][j].value){
                            provinceData[i][this.props.addressListAttr][j].childrensNum=this.state.secondValue[k].childrens.length;
                            provinceData[i][this.props.addressListAttr][j].childrens=this.state.secondValue[k].childrens;
                            break;
                        }
                    }
                }
            };


            for(var i=0;i<provinceData.length;i++){//得到子级个数
                for(var j=0;j<provinceData[i][this.props.addressListAttr].length;j++){
                    for(var k=0;k<this.state.disabledSecondValue.length;k++){
                        if(this.state.disabledSecondValue[k].value==provinceData[i][this.props.addressListAttr][j].value){
                            provinceData[i][this.props.addressListAttr][j].operateDisabled=true;//checkbox 不允许选中
                            break;
                        }
                    }
                }

            }
        }else{
            provinceData=   this.setPickerModel(realData);//生成标准格式model

            if(this.state.value instanceof  Array && this.state.value.length>0){//初始化勾选显示的数据
                var value=[];
                for(var i=0;i<this.state.value.length;i++){
                    value.push(this.state.value[i].value);
                };

                for(var i=0;i<provinceData.length;i++){//组件传过来的 一级初始值 进行设置
                    if(value.join().indexOf(provinceData[i].value)>-1){
                        provinceData[i].checked=true;
                    }else{
                        provinceData[i].checked=false;
                    }
                }
            }

            if(this.state.disabledValue instanceof  Array && this.state.disabledValue.length>0){
                var disabledValue=[];
                for(var i=0;i<this.state.disabledValue.length;i++){
                    disabledValue.push(this.state.disabledValue[i].value);
                };

                for(var i=0;i<provinceData.length;i++){//组件传过来的 一级初始值 进行设置
                    if(disabledValue.join().indexOf(provinceData[i].value)>-1){//值不允许操作
                        provinceData[i].disabled=true;
                    }else{
                        provinceData[i].disabled=false;
                    }
                }
            };

            for(var i=0;i<provinceData.length;i++){//得到子级个数
                for(var j=0;j<this.state.secondValue.length;j++){
                    if(this.state.secondValue[j].value==provinceData[i].value){
                        provinceData[i].childrensNum=this.state.secondValue[j].childrens.length;
                        provinceData[i].childrens=this.state.secondValue[j].childrens;//二级节点需要点击一级节点后才查的出  所以先存起数据  防止用户没查二级数据直接提交 拿不到二级选中值的bug
                        break;
                    }
                }
            }

            for(var i=0;i<provinceData.length;i++){//得到子级个数
                for(var j=0;j<this.state.disabledSecondValue.length;j++){
                    if(this.state.disabledSecondValue[j].value==provinceData[i].value){
                        provinceData[i].operateDisabled=true;
                        break;
                    }
                }
            }
        }

        var AllChecked=true;
        for(var i=0;i<provinceData.length;i++){
            if(!provinceData[i].checked){
                AllChecked=false;
            }
        };

        if(AllChecked){
            this.setState({
                allChecked:true,
            })
        }else{
            this.setState({
                allChecked:false,
            })
        }
        this.setState({
            data:provinceData
        })
    },
    loadSecondLevelSuccess:function(classIfyIndex,currentFirstLevelIndex,data) {//二级节点的数据加载成功
        let cityData=[];//当前一级节点的二级节点数据
        var realData=data;
        var newData=this.state.data;
        //获取真实数据
        if(this.props.dataSource==null) {
        }
        else {
            realData=unit.getSource(data,this.props.dataSource);
        }
        cityData=this.setPickerModel(realData);//生成二级节点数据模型
        if(this.props.classify){
            if(newData[classIfyIndex][this.props.addressListAttr][currentFirstLevelIndex].checked){
                for(var i=0;i<cityData.length;i++){
                    cityData[i].checked=true;
                }
            }
        }else{
            if(newData[currentFirstLevelIndex].checked){
                for(var i=0;i<cityData.length;i++){
                    cityData[i].checked=true;
                }
            }
        }

        if(cityData instanceof  Array &&cityData.length>0) {//有数据
            if(this.props.classify){
                newData[classIfyIndex][this.props.addressListAttr][currentFirstLevelIndex].childrens=cityData;//将查询的二级节点赋值给一级激活节点
                var expand=newData[classIfyIndex][this.props.addressListAttr][currentFirstLevelIndex].expand;
                for(var i=0;i<newData.length;i++){
                    newData[i][this.props.addressListAttr]=this.flodChildren(newData[i][this.props.addressListAttr]);//折叠
                }
                newData[classIfyIndex][this.props.addressListAttr][currentFirstLevelIndex].expand=true;//当前一级节点展开


                if(this.state.secondValue instanceof  Array && this.state.secondValue.length>0) {
                    var secondValue = [];
                    for (var i = 0; i < this.state.secondValue.length; i++) {
                        if(this.state.secondValue[i].childrens instanceof Array && this.state.secondValue[i].childrens.length>0){
                            for(var j=0;j<this.state.secondValue[i].childrens.length;j++){
                                secondValue.push(this.state.secondValue[i].childrens[j].value);
                            }
                        }
                    };
                    for(var i=0;i<newData.length;i++){//组件传过来的 一级初始值 进行设置
                        for(var j=0;j<newData[i][this.props.addressListAttr].length;j++){
                            if(newData[i][this.props.addressListAttr][j].childrens!=null &&newData[i][this.props.addressListAttr][j].childrens.length>0){
                                for(var k=0;k<newData[i][this.props.addressListAttr][j].childrens.length;k++){
                                    if(secondValue.join().indexOf(newData[i][this.props.addressListAttr][j].childrens[k].value)>-1){
                                        newData[i][this.props.addressListAttr][j].childrens[k].checked=true;
                                    }
                                }
                            }
                        }
                    }
                }


                if(this.state.disabledSecondValue instanceof  Array && this.state.disabledSecondValue.length>0) {
                    var disabledSecondValue = [];
                    for (var i = 0; i < this.state.disabledSecondValue.length; i++) {
                        if(this.state.disabledSecondValue[i].childrens instanceof Array && this.state.disabledSecondValue[i].childrens.length>0){
                            for(var j=0;j<this.state.disabledSecondValue[i].childrens.length;j++){
                                disabledSecondValue.push(this.state.disabledSecondValue[i].childrens[j].value);
                            }
                        }
                    };
                    for(var i=0;i<newData.length;i++){//组件传过来的 一级初始值 进行设置
                        for(var j=0;j<newData[i][this.props.addressListAttr].length;j++){
                            if(newData[i][this.props.addressListAttr][j].childrens!=null &&newData[i][this.props.addressListAttr][j].childrens.length>0){
                                for(var k=0;k<newData[i][this.props.addressListAttr][j].childrens.length;k++){
                                    if(disabledSecondValue.join().indexOf(newData[i][this.props.addressListAttr][j].childrens[k].value)>-1){
                                        newData[i][this.props.addressListAttr][j].childrens[k].disabled=true;
                                    }else{
                                        newData[i][this.props.addressListAttr][j].childrens[k].disabled=false;
                                    }
                                }
                            }
                        }
                    }
                }
            }else{
                newData[currentFirstLevelIndex].childrens=cityData;//将查询的二级节点赋值给一级激活节点
                var expand=newData[currentFirstLevelIndex].expand;
                newData=this.flodChildren(newData);//折叠
                newData[currentFirstLevelIndex].expand=true;//当前一级节点展开

                if(this.state.secondValue instanceof  Array && this.state.secondValue.length>0) {
                    var secondValue = [];
                    for (var i = 0; i < this.state.secondValue.length; i++) {
                        if(this.state.secondValue instanceof Array && this.state.secondValue.length>0){
                            for(var j=0;j<this.state.secondValue[i].childrens.length;j++){
                                secondValue.push(this.state.secondValue[i].childrens[j].value);
                            }
                        }
                    };
                    for(var i=0;i<newData.length;i++){//组件传过来的 一级初始值 进行设置
                        if(newData[i].childrens!=null &&newData[i].childrens.length>0){
                            for(var k=0;k<newData[i].childrens.length;k++){
                                if(secondValue.join().indexOf(newData[i].childrens[k].value)>-1){
                                    newData[i].childrens[k].checked=true;
                                }
                            }
                        }
                    }
                }

                if(this.state.disabledSecondValue instanceof  Array && this.state.disabledSecondValue.length>0) {
                    var disabledSecondValue = [];
                    for (var i = 0; i < this.state.disabledSecondValue.length; i++) {
                        if(this.state.disabledSecondValue[i].childrens instanceof Array && this.state.disabledSecondValue[i].childrens.length>0){
                            for(var j=0;j<this.state.disabledSecondValue[i].childrens.length;j++){
                                disabledSecondValue.push(this.state.disabledSecondValue[i].childrens[j].value);
                            }
                        }
                    };
                    for(var i=0;i<newData.length;i++){//组件传过来的 一级初始值 进行设置
                        if(newData[i].childrens!=null &&newData[i].childrens.length>0){
                            for(var k=0;k<newData[i].childrens.length;k++){
                                if(disabledSecondValue.join().indexOf(newData[i].childrens[k].value)>-1){
                                    newData[i].childrens[k].disabled=true;
                                }else{
                                    newData[i].childrens[k].disabled=false;
                                }
                            }
                        }
                    }
                }



            }
        }
        else {//没有数据,则直接执行选择事件
            Message.info("无数据");
            if(this.props.classify){
                for(var i=0;i<newData.length;i++){
                    newData[i][this.props.addressListAttr]=this.flodChildren(newData[i][this.props.addressListAttr]);//折叠
                }
            }else{
                newData=this.flodChildren(newData);//折叠
            }
            if (this.props.onSelect != null) {
                //this.props.onSelect(selectValue, selectText, this.props.name,null);
            }
        }
        this.setState({
            data:newData,
            provinceActiveIndex:currentFirstLevelIndex,
            cityActiveIndex:null,
            distinctActiveIndex:null,
        })

    },
    loadError:function(errorCode,message) {//查询失败
        Message. error(message);
    },
    flodChildren:function (data) {//将节点折叠起来
        for(var index=0;index<data.length;index++)
        {
            data[index].expand=false;
            if(data[index].childrens &&data[index].childrens instanceof  Array)
            {
                data[index].childrens=  this.flodChildren(data[index].childrens);//遍历
            }
        }
        return data;
    },
    setPickerModel:function(data) {//根据数据生成标准格式
        let realData = [];
        for (let index = 0; index < data.length; index++) {
            let pickerModel = new PickerModel(data[index][this.props.valueField],data[index][this.props.textField]);
            realData.push(pickerModel);
        }
        return realData;
    },
    stopagation(event){//阻止冒泡
        event.stopPropagation();
        if (event.nativeEvent.stopImmediatePropagation) {//阻止冒泡
            event.nativeEvent.stopImmediatePropagation();
        }
    },
    checkboxHandler(type,classifyIndex,rowIndex,childIndex,disabled,event){
        //type:是第几级的checkBox选择
        // classifyIndex:分类的下标值
        // rowIndex:第一级的下面值
        // childIndex:第二级的下标值
        // disabled:是否禁用
        if(disabled){
            return false;
        };
        event.stopPropagation();
        if (event.nativeEvent.stopImmediatePropagation) {//阻止冒泡
            event.nativeEvent.stopImmediatePropagation();
        }
        var data=this.state.data;
        if(this.props.classify){
            switch (type){
                case "firstLevel":
                    data[classifyIndex][this.props.addressListAttr][rowIndex].checked=!data[classifyIndex][this.props.addressListAttr][rowIndex].checked;
                    if(data[classifyIndex][this.props.addressListAttr][rowIndex].checked){
                        if(data[classifyIndex][this.props.addressListAttr][rowIndex].childrens instanceof Array){
                            for(var i=0;i<data[classifyIndex][this.props.addressListAttr][rowIndex].childrens.length;i++){
                                if(!data[classifyIndex][this.props.addressListAttr][rowIndex].childrens[i].disabled){
                                    data[classifyIndex][this.props.addressListAttr][rowIndex].childrens[i].checked=true;
                                }
                            }
                        }
                    }else{
                        if(data[classifyIndex][this.props.addressListAttr][rowIndex].childrens instanceof Array){
                            for(var i=0;i<data[classifyIndex][this.props.addressListAttr][rowIndex].childrens.length;i++){
                                if(!data[classifyIndex][this.props.addressListAttr][rowIndex].childrens[i].disabled){
                                    data[classifyIndex][this.props.addressListAttr][rowIndex].childrens[i].checked=false;
                                }
                            }
                        }
                    }

                    var classifyAllChecked=true;//到时候要封装
                    for(var i=0;i<data[classifyIndex][this.props.addressListAttr].length;i++){
                        if (!data[classifyIndex][this.props.addressListAttr][i].checked) {
                            classifyAllChecked = false;
                            break;
                        }
                    }

                    if(classifyAllChecked){
                        data[classifyIndex].checked=true;
                    }else{
                        data[classifyIndex].checked=false;
                    };
                    data[classifyIndex][this.props.addressListAttr][rowIndex].childrensNum="";
                    break;
                case "secondLevel":
                    data[classifyIndex][this.props.addressListAttr][rowIndex].childrens[childIndex].checked=!data[classifyIndex][this.props.addressListAttr][rowIndex].childrens[childIndex].checked;
                    var allChecked=true;
                    for(var i=0;i<data[classifyIndex][this.props.addressListAttr][rowIndex].childrens.length;i++) {//判断是否所有的二级选项都选择了
                        if (!data[classifyIndex][this.props.addressListAttr][rowIndex].childrens[i].checked) {
                            allChecked = false;
                            break;
                        }
                    };

                    if(allChecked){
                        data[classifyIndex][this.props.addressListAttr][rowIndex].checked=true;
                    }else{
                        data[classifyIndex][this.props.addressListAttr][rowIndex].checked=false;
                    };


                    var classifyAllChecked=true;
                    for(var i=0;i<data[classifyIndex][this.props.addressListAttr].length;i++){
                        if (!data[classifyIndex][this.props.addressListAttr][i].checked) {
                            classifyAllChecked = false;
                            break;
                        }
                    }

                    var num=0;
                    for(var i=0;i<data[classifyIndex][this.props.addressListAttr][rowIndex].childrens.length;i++) {
                        if (data[classifyIndex][this.props.addressListAttr][rowIndex].childrens[i].checked) {
                            num++;
                        };
                    };
                    data[classifyIndex][this.props.addressListAttr][rowIndex].childrensNum=num==data[classifyIndex][this.props.addressListAttr][rowIndex].childrens.length?"":num;

                    if(classifyAllChecked){
                        data[classifyIndex].checked=true;
                    }else{
                        data[classifyIndex].checked=false;
                    };
                    break;
            }
        }else{
            switch (type){
                case "firstLevel":
                    data[rowIndex].checked=!data[rowIndex].checked;
                    if(data[rowIndex].checked){
                        if(data[rowIndex].childrens){
                            for(var i=0;i<data[rowIndex].childrens.length;i++){
                                if(!data[rowIndex].childrens[i].disabled){
                                    data[rowIndex].childrens[i].checked=true;
                                }
                            }
                        }
                    }else{
                        if(data[rowIndex].childrens){
                            for(var i=0;i<data[rowIndex].childrens.length;i++){
                                if(!data[rowIndex].childrens[i].disabled){
                                    data[rowIndex].childrens[i].checked=false;
                                }
                            }
                        }
                    }
                    data[rowIndex].childrensNum="";
                    break;
                case "secondLevel":
                    data[rowIndex].childrens[childIndex].checked=!data[rowIndex].childrens[childIndex].checked;
                    var allChecked=true;
                    for(var i=0;i<data[rowIndex].childrens.length;i++) {//判断是否所有的二级选项都选择了
                        if (!data[rowIndex].childrens[i].checked) {
                            allChecked = false;
                            break;
                        }
                    };

                    var num=0;
                    for(var i=0;i<data[rowIndex].childrens.length;i++) {
                        if (data[rowIndex].childrens[i].checked) {
                            num++;
                        };
                    };
                    data[rowIndex].childrensNum=num==data[rowIndex].childrens.length?"":num;
                    if(allChecked){
                        data[rowIndex].checked=true;
                    }else{
                        data[rowIndex].checked=false;
                    };
                    break;
            }
        }


        var AllChecked=true;
        for(var i=0;i<data.length;i++){
            if(!data[i].checked){
                AllChecked=false;
            }
        };

        if(AllChecked){
            this.setState({
                allChecked:true,
            })
        }else{
            this.setState({
                allChecked:false,
            })
        }
        this.onSelect&&this.onSelect(data);
        this.setState({
            data:data,
        })
    },
    docClickHandle(classIfyIndex,currentFirstLevelIndex){//页面触发事件
        var newData=this.state.data;
        if(this.props.classify){
            for(var i=0;i<newData.length;i++){
                if(classIfyIndex!=i){
                    newData[i][this.props.addressListAttr]=  this.flodChildren(newData[i][this.props.addressListAttr]);//折叠
                }else{
                    newData[classIfyIndex][this.props.addressListAttr]=  this.flodChildren(newData[classIfyIndex][this.props.addressListAttr]);//折叠
                }
            }
        }else{
            newData=  this.flodChildren(newData);//折叠
        }
        this.setState({
            data:newData,
        })
        document.removeEventListener("click",this.docClickHandle,false);
    },
    activeFirstNodeHandler :function(classIfyIndex,currentFirstLevelIndex,currentFirstLevelValue,disabled,event) {//一级节点激活
        if(disabled){
            return false;
        }
        event.stopPropagation();
        if (event.nativeEvent.stopImmediatePropagation) {//阻止冒泡
            event.nativeEvent.stopImmediatePropagation();
        }
        var newData=this.state.data;
        if(this.props.classify){
            if(!newData[classIfyIndex][this.props.addressListAttr][currentFirstLevelIndex].expand){
                document.addEventListener("click",this.docClickHandle.bind(this,classIfyIndex,currentFirstLevelIndex),false);
            }
        }else{
            if(!newData[currentFirstLevelIndex].expand){
                document.addEventListener("click",this.docClickHandle.bind(this,null,currentFirstLevelIndex),false);
            }
        }
        if(this.state.provinceActiveIndex===currentFirstLevelIndex&&(this.props.classify?this.state.classIfyIndex===classIfyIndex:true)) {//当前节点为激活节点
            var newData=this.state.data;
            if(this.props.classify){
                if((newData[classIfyIndex][this.props.addressListAttr][currentFirstLevelIndex].childrens instanceof  Array)&&newData[classIfyIndex][this.props.addressListAttr][currentFirstLevelIndex].childrens.length>0) {
                    //有子节点则不执行选中事件
                    var expand=newData[classIfyIndex][this.props.addressListAttr][currentFirstLevelIndex].expand;
                    for(var i=0;i<newData.length;i++){
                        newData[i][this.props.addressListAttr]=this.flodChildren(newData[i][this.props.addressListAttr]);//折叠
                    }
                    newData[classIfyIndex][this.props.addressListAttr][currentFirstLevelIndex].expand=true;//当前一级节点展开

                }
                else {//没有则立即执行选中事件

                    if (this.props.onSelect != null) {
                        // this.props.onSelect(selectValue, selectText, this.props.name,null);
                    }

                }
            }else{
                if((newData[currentFirstLevelIndex].childrens instanceof  Array)&&newData[currentFirstLevelIndex].childrens.length>0) {
                    //有子节点则不执行选中事件
                    var expand=newData[currentFirstLevelIndex].expand;
                    newData=  this.flodChildren(newData);//折叠
                    newData[currentFirstLevelIndex].expand=true;//如果为展开状态则隐藏,否则展开1

                }
                else {//没有则立即执行选中事件

                    if (this.props.onSelect != null) {
                        // this.props.onSelect(selectValue, selectText, this.props.name,null);
                    }

                }
            }
            this.setState({
                data:newData,
                provinceActiveIndex:currentFirstLevelIndex,
                classIfyIndex:classIfyIndex,
                cityActiveIndex:null,
                distinctActiveIndex:null,
            })
        }
        else {
            //当前节点不是激活节点
            if(this.props.secondUrl!=null) {//存在二级节点url并且没有查询过
                let url=this.props.secondUrl;
                let params=this.state.secondParams;
                if(typeof  params =="object")
                {//判断是否为对象
                    params[this.state.secondParamsKey]=currentFirstLevelValue;
                }
                else
                {
                    params={};
                    if(this.state.secondParamsKey!=null)
                    {
                        params[this.state.secondParamsKey]=currentFirstLevelValue;
                    }

                }
                var fetchmodel=new FetchModel(url,this.loadSecondLevelSuccess.bind(this,classIfyIndex,currentFirstLevelIndex),params,this.loadError);
                unit.fetch.post(fetchmodel);
            }
            else {//没有二级节点的url
                var newData=this.state.data;

                var expand= newData[currentFirstLevelIndex].expand;
                newData= this.flodChildren(newData);//折叠
                newData[currentFirstLevelIndex].expand=true;

                if((newData[currentFirstLevelIndex].childrens instanceof  Array)&&newData[currentFirstLevelIndex].childrens.length>0) {
                    //有子节点则不执行选中事件
                }
                else {//没有则立即执行选中事件
                    if (this.props.onSelect != null) {
                        //this.props.onSelect(selectValue, selectText, this.props.name,null);
                    }

                }
            }
            this.setState({
                data:newData,
                provinceActiveIndex:currentFirstLevelIndex,
                classIfyIndex:classIfyIndex,
                cityActiveIndex:null,
                distinctActiveIndex:null,
            })
        }


    },
    btnClickHandler(classifyIndex,rowIndex){
        this.docClickHandle(classifyIndex,rowIndex);
    },
    classifyHandler(classifyIndex,disabled){
        if(disabled){
            return false;
        }
        var newData=this.state.data;
        newData[classifyIndex].checked=!newData[classifyIndex].checked;
        for(var i=0;i<newData[classifyIndex][this.props.addressListAttr].length;i++){
            newData[classifyIndex].checked?newData[classifyIndex][this.props.addressListAttr][i].checked=true:newData[classifyIndex][this.props.addressListAttr][i].checked=false;
            if((newData[classifyIndex][this.props.addressListAttr][i].childrens instanceof  Array)&&newData[classifyIndex][this.props.addressListAttr][i].childrens.length>0){
                for(var j=0;j<newData[classifyIndex][this.props.addressListAttr][i].childrens.length;j++){
                    newData[classifyIndex].checked?newData[classifyIndex][this.props.addressListAttr][i].childrens[j].checked=true:newData[classifyIndex][this.props.addressListAttr][i].childrens[j].checked=false;
                }
            }
        };

        for(var i=0;i<newData[classifyIndex][this.props.addressListAttr].length;i++){
            if(newData[classifyIndex].checked){//区域全选
                newData[classifyIndex][this.props.addressListAttr][i].childrensNum="";
            }
        };

        this.props.onSelect&&this.props.onSelect(data);
        this.setState({
            data:newData
        })
    },
    renderFirstLevel(){
        var renderFirstLevel=[];
        if(this.state.data instanceof  Array){
            renderFirstLevel=this.state.data.map((obj,i)=>{
                if(this.props.classify){//分类别显示

                    var classifyDisbled=obj.disabled?"classifyDisabled ":"";
                    var classifyCheck=obj.checked?"checked ":"";
                    var classifyClassName="classifyName wasabi-multiplePicker-checkbox "+classifyDisbled+classifyCheck
                    return (
                        <li key={"classify"+i} className="classify-content clearfix">
                            <div  className={classifyClassName}>
                                <i onClick={this.classifyHandler.bind(this,i,obj.disabled)}></i>
                                <input type="checkbox" id="checkboxOneInput" name="" />
                                <label >
                                    <span style={{fontWeight:"bold"}}>{obj.areaName}</span>
                                </label>
                            </div>
                            <ul className="classify-child-wrap">
                                {
                                    obj[this.props.addressListAttr].map((rowData,rowIndex)=>{// 用"[this.props.addressListAttr]"得到类别下的数据
                                        if(rowIndex%4<2){
                                            var left=0;
                                        }else{
                                            var left=-309;
                                        };
                                        var check=rowData.checked?"checked ":"";
                                        var disbled=rowData.disabled?"checkBoxDisabled ":"";
                                        var  hasChild=rowData.childrensNum?"hasChild ":"";
                                        var checkBoxClassName="wasabi-multiplePicker-checkbox "+check+hasChild+disbled;
                                        var firstLevelCheckBoxClassName=rowData.operateDisabled?"firstLevelCheckBoxDisabled":""
                                        return (
                                            <li key={"fistLevel"+rowIndex} className={(rowIndex==this.state.provinceActiveIndex&&rowData.expand)?"fistLevel-childLi active":"fistLevel-childLi"}>
                                                <div className={checkBoxClassName}>
                                                    <i onClick={this.checkboxHandler.bind(this,"firstLevel",i,rowIndex,null,(rowData.disabled||obj.operateDisabled))} className={firstLevelCheckBoxClassName}></i>
                                                    <input type="checkbox"  id="checkboxOneInput" name="" />
                                                    <label onClick={this.activeFirstNodeHandler.bind(this,i,rowIndex,rowData.value,rowData.disabled)} style={{cursor:this.props.secondUrl?"pointer":"auto"}}>
                                                        <span title={rowData.text}>{rowData.text}</span>
                                                        <em>{rowData.childrensNum?<span>({rowData.childrensNum})</span>:""}</em>
                                                        <i className="icon-drop" style={{display:this.props.secondUrl?"inline-block":"none"}}></i>
                                                    </label>
                                                </div>
                                                <ul onClick={this.stopagation} ref="secondLevelWrap" className="secondLevelWrap" style={{display:(rowData.expand?"block":"none"),left:left}}>
                                                    {
                                                        this.renderSecondLevel(i,rowIndex,rowData.childrens)
                                                    }
                                                    <li className="closeBtn"><Button title="关闭" name="close" theme="solid" className="close" onClick={this.btnClickHandler.bind(this,i,rowIndex)}/></li>
                                                </ul>
                                            </li>
                                        )
                                    })
                                }
                            </ul>
                        </li>
                    )
                }else{
                    if(i%5<3){
                        var left=0;
                    }else{
                        var left=-309;
                    }

                    var check=obj.checked?"checked ":"";
                    var  hasChild=obj.childrensNum?"hasChild ":"";
                    var disbled=obj.disabled?"checkBoxDisabled ":""
                    var checkBoxClassName="wasabi-multiplePicker-checkbox "+check+hasChild+disbled;
                    var firstLevelCheckBoxClassName=obj.operateDisabled?"firstLevelCheckBoxDisabled":""
                    return (
                        <li key={"fistLevel"+i} className={(i==this.state.provinceActiveIndex&&obj.expand)?"fistLevel-childLi active":"fistLevel-childLi"}>
                            <div className={checkBoxClassName}>
                                <i onClick={this.checkboxHandler.bind(this,"firstLevel",null,i,null,(obj.disabled||obj.operateDisabled))} className={firstLevelCheckBoxClassName}></i>
                                <input type="checkbox" id="checkboxOneInput" name="" />
                                <label onClick={this.activeFirstNodeHandler.bind(this,null,i,obj.value,obj.disabled)} style={{cursor:this.props.secondUrl?"pointer":"auto"}}>
                                    <span title={obj.text}>{obj.text}</span>
                                    <em>{obj.childrensNum?<span>({obj.childrensNum})</span>:""}</em>
                                    <i className="icon-drop" style={{display:this.props.secondUrl?"inline-block":"none"}}></i>
                                </label>
                            </div>
                            <ul onClick={this.stopagation} ref="secondLevelWrap" className="secondLevelWrap" style={{display:(obj.expand?"block":"none"),left:left}}>
                                {
                                    this.renderSecondLevel(null,i,obj.childrens)
                                }
                                <li className="closeBtn"><Button title="关闭" name="close" theme="solid" className="close" onClick={this.btnClickHandler.bind(this,null,i)}/></li>
                            </ul>
                        </li>
                    )
                }
            });
            return renderFirstLevel;
        }
        else
        {
            return null;
        }
    },
    renderSecondLevel(classifyIndex,rowIndex,secondLevelData){
        var renderSecondLevel=[];
        if(secondLevelData instanceof  Array){
            renderSecondLevel=secondLevelData.map((child,childIndex)=>{
                var check=child.checked?"checked ":"";
                var disbled=child.disabled?"checkBoxDisabled ":""
                var checkBoxClassName="wasabi-multiplePicker-checkbox "+check+disbled;
                return (
                    <li key={"secondLevel"+childIndex}>
                        <div className={checkBoxClassName} onClick={this.checkboxHandler.bind(this,"secondLevel",classifyIndex,rowIndex,childIndex,child.disabled)}>
                            <i ></i>
                            <input type="checkbox" value={child.value} id="checkboxOneInput" name="" />
                            <label>
                                <span title={child.text}>{child.text}</span>
                            </label>
                        </div>
                    </li>
                )
            });
            return renderSecondLevel;
        }
        else
        {
            return null;
        }
    },
    getData(){
        var newData=this.state.data;
       if(this.props.classify){
           var filterData = newData
               .map(function(item) {
                  if(item.checked){
                      item[this.props.addressListAttr]=item[this.props.addressListAttr].map((cityList)=>{
                          cityList.childrens=null;
                          return cityList;
                      })
                  }else{
                      item[this.props.addressListAttr]=item[this.props.addressListAttr].map((cityList)=>{
                         if(cityList.checked){
                             cityList.childrens=null;
                         }else if(cityList.childrens instanceof Array){
                             cityList.childrens=cityList.childrens.filter(function(obj) {//当前级 非全新则返回选中的数据
                                 return obj.checked ==true;
                             });
                         };
                         return cityList;
                      })
                  }
                   return item;
               }.bind(this));


           filterData=filterData.map((item,index)=>{
               item[this.props.addressListAttr]=item[this.props.addressListAttr].filter((list)=>{
                   if(list.childrens==null&&list.checked==false){

                   }else if(list.childrens==null&&list.checked==true){
                       return list;
                   }else{
                       return list.childrens.length!=0;
                   }
               });
               return item;
           }).filter((obj)=>{
               return obj[this.props.addressListAttr].length!=0;
           });

       }else{
           var filterData = newData
               .map(function (item) {
                   if(item.checked){//上一级选中  下一级的详细信息忽略不传
                        item.childrens=null;
                   }else if(item.childrens instanceof Array){
                       item.childrens=item.childrens.filter(function(obj) {//当前级 非全新则返回选中的数据
                           return obj.checked ==true;
                       });
                   }
                   return item;
               })
               .filter(function (item) {//再进行帅选一次
                   if(item.childrens==null&&item.checked==false){

                   }else if(item.childrens==null&&item.checked==true){
                       return item;
                   }else{
                       return item.childrens.length!=0;
                   }
               });
       };
      return filterData;
    },
    allCheckedHandler(){
        var newData=this.state.data;
        if(this.state.classify){
            for(var i=0;i<newData.length;i++){
                newData[i].checked=!this.state.allChecked;

                for(var j=0;j<newData[i][this.props.addressListAttr].length;j++){
                    if(!newData[i][this.props.addressListAttr][j].disabled){
                        newData[i][this.props.addressListAttr][j].checked=!this.state.allChecked;
                    }
                    if((newData[i][this.props.addressListAttr][j].childrens instanceof  Array)&&newData[i][this.props.addressListAttr][j].childrens.length>0){
                        for(var k=0;k<newData[i][this.props.addressListAttr][j].childrens.length;k++){
                            if(!newData[i][this.props.addressListAttr][j].childrens[k].disabled){
                                newData[i][this.props.addressListAttr][j].childrens[k].checked=!this.state.allChecked;
                            }
                        }
                    }
                };
            }
        }else{
            for(var i=0;i<newData.length;i++){
                if(!newData[i].disabled){
                    newData[i].checked=!this.state.allChecked;
                }
                if(newData[i].childrens instanceof Array && newData[i].childrens.length>0){
                    for(var j=0;j<newData[i].childrens.length;j++){
                        if(!newData[i].childrens[j].disabled){
                            newData[i].childrens[j].checked=!this.state.allChecked;
                        }
                    }
                }
            }
        }

        this.setState({
            allChecked:!this.state.allChecked,
            newData:newData,
        })
    },
    open(){
      this.refs.modal.open();
        this.setState({
            provinceActiveIndex:null,
            classIfyIndex:null,
            allChecked:false,
        })
    },
    close(){
        this.refs.modal.close();
    },
    modalOkHandler(){
        this.props.okHandler && this.props.okHandler(this.getData())
    },
    modalCancelHandler(){
        this.refs.modal.close();
    },
    render(){
        return (
            <Modal className="wasabi-multiplePicker" title="请选择区域" height={this.props.height?this.props.height:this.props.classify?520:400} width={this.props.width?this.props.width:this.props.classify?810:640} ref="modal" showOK={true} showCancel={true} OKHandler={this.modalOkHandler} cancelHandler={this.modalCancelHandler}>
                <div className="wasabi-multiplePicker">
                    <div className="allCheckedWrap" style={{display:"none"}}>
                        <div onClick={this.allCheckedHandler} className={this.state.allChecked?"wasabi-multiplePicker-checkbox checked":"wasabi-multiplePicker-checkbox"}>
                            <i></i>
                            <input type="checkbox" id="checkboxOneInput" name="" />
                            <label><span>全选</span></label>
                        </div>
                    </div>
                    <ul className="fistLevelWrap clearfix">
                        {
                            this.renderFirstLevel()
                        }
                    </ul>
                </div>
            </Modal>
        )
    }
});


module.exports=MultiplePicker;