/**
 * @author ALOG
 * @createTime 17/4/21
 * @description  设置表头的table
 */
require("../Sass/Data/MiniTable.scss");
var React=require("react");
var Modal=require("../Layout/Modal.jsx");
var Message=require("../Unit/Message.jsx");
var Button=require("../Buttons/Button.jsx");


var MiniTable=React.createClass({
    propTypes: {
        data:React.PropTypes.array,//列表数据
        OKHandler:React.PropTypes.func,//提交事件
        draggable:React.PropTypes.bool,//是否允许拖拽
    },
    getDefaultProps:function(){
        return {
            draggable:true,
        }
    },
    getInitialState(){
        return {
            data:this.props.data,
        }
    },
    componentWillReceiveProps(nextProps){
        this.setState({
            data:nextProps.data,
        })
    },
    checkboxClick(rowIndex){
       var data= this.state.data;
        data[rowIndex].hide=!data[rowIndex].hide;
        if(this.isAllHide(data)){
            Message.info("至少选择一个");
            data[rowIndex].hide=false;
        }
        this.setState({
          data:data,
        })
    },

    isAllHide(data){
        var isAllHide=true;
        for(var i=0;i<data.length;i++){
            if(!data[i].hide){//不是全部隐藏
                isAllHide=false;
                break;
            };
        };
        return isAllHide;
    },
    //拖拽
    domdrugstart(index,e) {
        this.dragStartIndex=index;//记录最开始拖拽元素对应的下标值
    },
    domdrugenter(index,e) {
        var newData=this.state.data;
        var allItme=document.getElementsByTagName("tr");
        for (var i=0;i<allItme.length;i++){
            allItme[i].classList.remove('dragOver');
            allItme[i].style.opacity = '1';
        }
        console.log(e.target)
        e.target.parentElement.classList.add('dragOver');
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
        e.target.classList.remove('dragOver');
    },
    domdrop(index,e) {
        if (e.stopPropagation) {
            e.stopPropagation();
        }
        return false;
    },
    domdrapend(e) {
        var allItme=document.getElementsByTagName("tr");
        for (var i=0;i<allItme.length;i++){
            allItme[i].classList.remove('dragOver');
            allItme[i].style.opacity = '1';
        }
        this.props.dropEnd&&this.props.dropEnd(this.state.data);
    },

    renderBody(){
        var renderBody=[];
        if(this.state.data instanceof Array && this.state.data.length>0){
            this.state.data.map((rowData,rowIndex)=>{
                var checkClassName=rowData.hide?"table-checkbox":"table-checkbox checked";
                renderBody.push(<tr key={"body"+rowIndex}
                                    draggable={this.props.draggable}
                                    onDragStart={this.domdrugstart.bind(this,rowIndex,rowData)}
                                    onDragEnter={this.domdrugenter.bind(this,rowIndex)}
                                    onDragOver={this.domdrugover}
                                    onDragLeave={this.domdrugleave}
                                    onDrop={this.domdrop.bind(this,rowIndex)}
                                    onDragEnd={this.domdrapend}>
                    <td className="firstTd"><i className="icon-drag"></i>{rowIndex}</td>
                    <td className="centerTd">{rowData.label}</td>
                    <td className="lastTd"><div className={checkClassName} onClick={this.checkboxClick.bind(this,rowIndex)}></div></td>
                </tr>)
            });
        }
        return renderBody;
    },
    open(){
        this.refs.wasabiSetHeaderModal.open();
    },
    close(){
        this.refs.wasabiSetHeaderModal.close();
    },
    setModalOKHandler(){
        this.props.OKHandler&&this.props.OKHandler(this.state.data);
    },
    resetHandler(){//还原默认设置
        this.props.resetHandler&&this.props.resetHandler();
    },
    render(){
        return (
        <Modal ref="wasabiSetHeaderModal"
               className="wasabiSetHeaderModal"
               tipShow={true}
               tipContent="拖拽行可以编辑排列顺序哦,试试吧!"
               title="设置表头" height={500} width={650} resize={false}
               showOK={true} showCancel={true} OKHandler={this.setModalOKHandler}
               footerContent={<Button title="还原默认设置" key="reset" theme="cancel" onClick={this.resetHandler}
                                      style={{ height: 30}}></Button>}
        >
            <div>
                <div className="fixed-table" ref="fixedTable">
                    <table className="miniTable">
                        <thead>
                        <tr>
                            <th className="firstTd">行号</th>
                            <th className="centerTd">列名</th>
                            <th className="firstTd">显示</th>
                        </tr>
                        </thead>
                    </table>
                </div>
                <div className="real-table" ref="realTable">
                    <table className="miniTable">

                        <tbody>
                        {
                            this.renderBody()
                        }
                        </tbody>
                    </table>
                </div>
            </div>
        </Modal>
        )
    }
});
module.exports=MiniTable;