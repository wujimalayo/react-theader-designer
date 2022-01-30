import React from "react";
import './cell.css'
/*  
    表头单元格组件
    只负责基础样式的展示 如：
    宽高，位置，选中状态，css、字体等样式

    单元格的静态属性：
    row 所在行数（基础单元格）
    column 所在列数（基础单元格）

    单元格的动态属性:
    id 单元格唯一标识
    selected 是否被选中
    rowSpan 占用行数
    colSpan 占用列数
    colWidthList 外部列宽列表
    rowHeightList 外部行高列表

    回调函数：
    mouseDown 鼠标点下事件
    mouseOver 鼠标滑入事件（每次滑入只触发一次）
*/
function Cell({
    id,
    row,
    column,
    selected = false,
    rowSpan = 1,
    colSpan = 1,
    mouseDown,
    mouseOver,
    colWidthList,
    rowHeightList,
    cellStyles = {}
}) {
    const styles = {
        height: rowHeightList.slice(row, row + rowSpan).reduce((prev, next) => prev + next),
        width: colWidthList.slice(column, column + colSpan).reduce((prev, next) => prev + next),
        left: column === 0 ? 0 : colWidthList.slice(0, column).reduce((prev, next) => prev + next),
        top: row === 0 ? 0 : rowHeightList.slice(0, row).reduce((prev, next) => prev + next),
        boxShadow: selected ? '0 0 0 1px rgba(0,0,0,1) inset' : '0 0 0 1px rgba(0,0,0,0.2)',
        ...cellStyles
    }

    const handleMouseDown = () => {
        mouseDown(row, column, rowSpan, colSpan)
    }

    const handleMouseOver = () => {
        mouseOver(row, column, rowSpan, colSpan)
    }

    return (
        <div
            className="t-head-cell"
            onMouseDown={handleMouseDown}
            onMouseOver={handleMouseOver}
            style={styles}>
            {id}
        </div>
    )
}

export default Cell