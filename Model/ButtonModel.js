/**
 * Created by zhiyongwang on 2016-02-25.
 * 工具栏按钮数据模型
 */
class ButtonModel
{
    constructor(name,title,theme="none",type="button",url=null)
    {
        this.name=name;
        this.title=title;
        this.disabled=false;
        this.iconCls=null;
        this.iconAlign="left";
        this.href="javascript:void(0);";
        this.onClick=null;
        this.backgroundColor=null;
        this.tip=null;
        this.theme=theme;
        this.type=type,
        this.size="default";
        this.color=null;
        this.hide=false;
        this.className=null;
        this.style=null;
        this.draggable=false;



        this.url=url;
        this.dataSource="data";//ajax的返回的数据源中哪个属性作为数据源,为null时直接后台返回的数据作为数据源
        this.valueField="value";//按钮下拉框数据字段值名称
        this.textField="text";//按钮下拉框数据文本名称
        this.data=[];

    }
}
module .exports=ButtonModel;