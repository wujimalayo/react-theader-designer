import React, { useEffect, useState, useImperativeHandle } from "react";
import Cell from "../cell/cell.js"
import ToolCell from "../cell/toolCell.js";
import './header.css'

const Header = ({
    dataSource,
    styleConfig = {},
    colWidthList,
    rowHeightList,
    historyChange,
    toolClick
}, ref) => {
    // console.log('header reload');
    useImperativeHandle(ref, () => ({
        backHistory,
        forwardHistory,
        saveAsHistory,
        mergeSelectedCells,
        splitSelectedCells,
        initCells,
        handleTempletMouseUp,
        setFontStyleToSelectedCells
    }))
    /* 
        表头（表格）组件
        负责渲染表头、组件的状态管理以及核心功能处理
    */
    // 单元格矩阵（单元格的数据映射对象）
    const [cellMatrix, setCellMatrix] = useState([])
    useEffect(() => {
        setCellMatrix(dataSource)
    }, [dataSource])
    const [rowList, setRowList] = useState([])
    const [colList, setColList] = useState([])
    useEffect(() => {
        setRowList(rowHeightList)
        setColList(colWidthList)
    }, [rowHeightList, colWidthList])
    // 鼠标是否被按下
    const [isMouseDown, setMouseDown] = useState(false)
    // 鼠标按下单元格的范围坐标
    const [initRange, setInitRange] = useState({
        rowMin: 0,
        rowMax: 0,
        colMin: 0,
        colMax: 0
    })
    // 鼠标实时移动的范围坐标（按下单元格到鼠标所处单元格覆盖的范围）
    const [hoverRange, setHoverRange] = useState({
        isExpand: false,
        rowMin: 0,
        rowMax: 0,
        colMin: 0,
        colMax: 0
    })
    // 监听鼠标滑过范围更新单元格选中状态
    useEffect(() => {
        if (hoverRange.isExpand) {
            getMaxHoverRange(hoverRange)
        }
    }, [hoverRange])
    // 表头容器大小
    const [containerStyle, setContainerStyle] = useState({
        width: 0,
        height: 0
    })
    useEffect(() => {
        let transform = `scale(${styleConfig.scale || '1.0'})`
        setContainerStyle({
            ...containerStyle,
            transform
        })
    }, [styleConfig])
    useEffect(() => {
        setContainerStyle({
            ...containerStyle,
            width: colWidthList.reduce((prev, next) => prev + next),
            height: rowHeightList.reduce((prev, next) => prev + next)
        })
        setColCount(colWidthList.length)
        setRowCount(rowHeightList.length)
    }, [colWidthList, rowHeightList])
    // 基础单元格行列数
    const [rowCount, setRowCount] = useState(0)
    const [colCount, setColCount] = useState(0)
    useEffect(() => {
        let toolCellList = []
        for (let i = 0; i < colCount; i++) {
            toolCellList.push({
                column: i
            })
        }
        for (let i = 0; i < rowCount; i++) {
            toolCellList.push({
                row: i
            })
        }
        setToolCells(toolCellList)
    }, [rowCount, colCount])
    const [toolCells, setToolCells] = useState([])

    /* 一些公共方法  */
    // 获取当前选中的单元格
    const getSeletedCells = (type = true) => {
        // type true:选中 false:非选中
        let cells = []
        if (type) {
            cells = cellMatrix.filter(cell => cell.selected)
        } else {
            cells = cellMatrix.filter(cell => !cell.selected)
        }
        return {
            cells: cells,
            length: cells.length,
            idList: cells.map(cell => cell.id)
        }
    }

    // 单元格鼠标按下事件
    const handleCellMouseDown = (row, column, rowSpan, colSpan) => {
        initCells()
        if (!isMouseDown) {
            setMouseDown(true)
            let range = {
                rowMin: row,
                rowMax: row + rowSpan,
                colMin: column,
                colMax: column + colSpan,
            }
            setInitRange(range)
            renderHoveredCells(range)
        }
    }

    // 单元格鼠标停留事件
    const handleCellMouseOver = (row, column, rowSpan, colSpan) => {
        if (isMouseDown) {
            let range = JSON.parse(JSON.stringify(initRange))
            // 鼠标移回到初始单元格
            if (initRange.rowMin === row && initRange.colMin === column) {
                return setHoverRange({ ...range, isExpand: true })
            }
            // 设置初始单元格到鼠标抬起单元格间的范围
            let newRange = cellExpandRange(range, { row, column, rowSpan, colSpan })
            setHoverRange({ ...newRange })
        }
    }

    // 单元格面板鼠标松开事件
    const handleTempletMouseUp = () => {
        if (isMouseDown) {
            setMouseDown(false)
        }
    }

    // 获得最终单元格应覆盖（选中）范围
    const getMaxHoverRange = (range) => {
        /* 
            1.获取任意四角坐标属于当前范围内的单元格列表
            2.遍历单元格列表使边界拓展
            3.有拓展继续递归，无拓展渲染
        */
        // let index = 0
        let tempRange = JSON.parse(JSON.stringify(range))
        for (let cell of cellMatrix) {
            // 时间复杂度：O(n) 不确定有无BUG
            tempRange = toExpandRange(tempRange, cell)

            /* // 时间复杂度：O(n^2)
            let newRange = toExpandRange(tempRange, cell)
            if (newRange.isExpand) {
                getMaxHoverRange(newRange)
                break
            }
            if (index++ >= cellMatrix.length - 1) {
                renderHoveredCells()
                break
            } */
        }
        setHoverRange({ ...tempRange, isExpand: false })
        renderHoveredCells(tempRange)
    }

    // 单元格拓展范围预处理
    const toExpandRange = (range, cell) => {
        range.isExpand = false
        // 不属于范围内直接返回
        if (cell.row >= range.rowMax || (cell.row + cell.rowSpan) <= range.rowMin || cell.column >= range.colMax || (cell.column + cell.colSpan) <= range.colMin) {
            return range
        }
        // 属于范围内执行拓展
        return cellExpandRange(range, cell)
    }

    // 直接拓展范围
    const cellExpandRange = (range, cell) => {
        // 输入单元格输出拓展后的范围
        if (cell.row < range.rowMin) {
            range.rowMin = cell.row
            range.isExpand = true
        }
        if ((cell.row + cell.rowSpan) > range.rowMax) {
            range.rowMax = (cell.row + cell.rowSpan)
            range.isExpand = true
        }
        if (cell.column < range.colMin) {
            range.colMin = cell.column
            range.isExpand = true
        }
        if ((cell.column + cell.colSpan) > range.colMax) {
            range.colMax = (cell.column + cell.colSpan)
            range.isExpand = true
        }
        return range
    }

    // 渲染单元格选中状态
    const renderHoveredCells = (range = hoverRange) => {
        /* 
            根据范围高亮选中单元格
        */
        const { rowMin: a, rowMax: b, colMin: c, colMax: d } = range
        // 获取鼠标滑过范围的单元格
        let cellsAfterHover = cellMatrix.map(cell => {
            return (cell.row >= a && (cell.row + cell.rowSpan) <= b && cell.column >= c && (cell.column + cell.colSpan) <= d) ?
                {
                    ...cell,
                    selected: true
                } : {
                    ...cell,
                    selected: false
                }
        })
        setCellMatrix(cellsAfterHover)
    }

    // 取消所有单元格选中状态
    const initCells = () => {
        const unselectedCells = cellMatrix.map(cell => {
            return {
                ...cell,
                selected: false
            }
        })
        setCellMatrix(unselectedCells)
    }

    // 操作历史记录
    const [historyStack, setHistoryStack] = useState([])
    // 历史记录下标
    const [historyCurrent, setHistoryCurrent] = useState(0)
    // 历史操作按钮状态
    const [backDisabled, setBackDisabled] = useState(true)
    const [forwardDisabled, setForwardDisabled] = useState(true)
    useEffect(() => {
        let historyLength = historyStack.length
        if (historyLength > historyCurrent) {
            setCellMatrix(historyStack[historyCurrent])
        }
        if (historyCurrent <= 0) {
            setBackDisabled(true)
        } else {
            setBackDisabled(false)
        }
        if (historyCurrent + 1 < historyLength) {
            setForwardDisabled(false)
        } else {
            setForwardDisabled(true)
        }
    }, [historyCurrent])
    useEffect(() => {
        handleHistoryChange()
    }, [backDisabled])
    useEffect(() => {
        handleHistoryChange()
    }, [forwardDisabled])
    const backHistory = () => setHistoryCurrent(current => current - 1)
    const forwardHistory = () => setHistoryCurrent(current => current + 1)
    const handleHistoryChange = () => historyChange({ backDisabled, forwardDisabled })

    // 保存历史记录
    const saveAsHistory = (newMatrix) => {
        // 保存历史记录
        let history = [], historyLength = historyStack.length
        if (!historyLength) {
            history.push(cellMatrix)
        } else if (historyLength > historyCurrent - 1) {
            history = historyStack.slice(0, historyCurrent + 1)
        } else {
            history = historyStack
        }
        history.push(newMatrix)
        setHistoryStack(history)
        setHistoryCurrent(current => current + 1)
    }

    // 合并单元格
    const mergeSelectedCells = () => {
        let selectedCells = getSeletedCells()
        if (selectedCells.length <= 1) {
            return alert('请选中两个或以上单元格')
        }
        // 构造合并后的新矩阵
        let newMatrix = getSeletedCells(false).cells
        newMatrix.push({
            ...selectedCells.cells[0],
            row: hoverRange.rowMin,
            column: hoverRange.colMin,
            rowSpan: Number(hoverRange.rowMax - hoverRange.rowMin),
            colSpan: Number(hoverRange.colMax - hoverRange.colMin),
            selected: true
        })
        saveAsHistory(newMatrix)
    }

    // 取消单元格合并
    const splitSelectedCells = () => {
        if (cellMatrix.findIndex(cell => cell.selected) < 0) {
            return alert('请选中至少一个单元格')
        }
        let newMatrix = [], unselectedCount = 0
        cellMatrix.forEach(cell => {
            if (cell.selected && (cell.colSpan > 1 || cell.rowSpan > 1)) {
                // 需要被拆分的单元格
                let { row, column, rowSpan, colSpan } = cell
                for (let i = row; i < row + rowSpan; i++) {
                    for (let j = column; j < column + colSpan; j++) {
                        newMatrix.push({
                            id: j + '-' + i,
                            column: j,
                            colSpan: 1,
                            row: i,
                            rowSpan: 1,
                            selected: true
                        })
                    }
                }
                unselectedCount++
            } else {
                // 不需要的
                newMatrix.push(cell)
            }
        })
        if (unselectedCount > 0) saveAsHistory(newMatrix)
    }

    // 设置单元格样式
    const setFontStyleToSelectedCells = (styles) => {
        if (cellMatrix.findIndex(cell => cell.selected) < 0) {
            return alert('请选中至少一个单元格')
        }
        let newMatrix = cellMatrix.map(cell => {
            return cell.selected ? {
                ...cell,
                cellStyles: {
                    ...cell.cellStyles,
                    ...styles
                }
            } : cell
        })
        saveAsHistory(newMatrix)
    }

    const selectRowOrColumn = ({ row, column, left, top }) => {
        let range = {}
        if (row >= 0) {
            range = {
                isExpand: true,
                rowMin: row,
                colMin: 0,
                rowMax: row + 1,
                colMax: colCount
            }
        } else if (column >= 0) {
            range = {
                isExpand: true,
                rowMin: 0,
                colMin: column,
                rowMax: rowCount,
                colMax: column + 1
            }
        }
        toolClick({ row, column, left, top })
        setHoverRange(range)
    }

    return (
        <div className="header-container"
            style={containerStyle}>
            {toolCells.map((cell, index) =>
                <ToolCell
                    key={index}
                    handleClick={selectRowOrColumn}
                    colWidthList={colList}
                    rowHeightList={rowList}
                    {...cell}
                />)}
            {cellMatrix.map(cell =>
                <Cell
                    key={cell.id}
                    mouseDown={handleCellMouseDown}
                    mouseOver={handleCellMouseOver}
                    colWidthList={colList}
                    rowHeightList={rowList}
                    {...cell}
                />
            )}
        </div>
    )
}

export default Header