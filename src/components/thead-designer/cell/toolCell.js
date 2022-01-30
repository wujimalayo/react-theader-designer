import React from "react";
import './cell.css'

/* 
    表头工具单元格组件
    附着在第一行、列单元格上、左侧
    负责整行、整列的业务处理
*/
function ToolCell({
    row = -1,
    column = -1,
    colWidthList,
    rowHeightList,
    handleClick
}) {
    // row:左侧行工具 column:顶部列工具
    const styles = {
        width: row >= 0 ? 40 : colWidthList[column],
        height: column >= 0 ? 20 : rowHeightList[row],
        left: column >= 0 ? (column === 0 ? 0 : colWidthList.slice(0, column).reduce((prev, next) => prev + next)) : -40,
        top: row >= 0 ? (row === 0 ? 0 : rowHeightList.slice(0, row).reduce((prev, next) => prev + next)) : -20,
        backgroundColor: '#D8D8D8',
        color: '#666666',
        fontSize: 14
    }

    const onClick = () => {
        handleClick({
            row,
            column,
            left: styles.left,
            top: styles.top
        })
    }

    return (
        <div
            className="t-head-cell"
            style={styles}
            onClick={onClick}>
            {row >= 0 ? '➡' : '⬇'}
        </div>
    )
}

export default ToolCell