import React, { useEffect, useRef, forwardRef, useState } from "react";
import Header from "./table/header";
import './index.css';
import { CompactPicker } from "react-color";

const RefHeader = forwardRef(Header)
const TheadDesigner = () => {
    const headerRef = useRef(null)
    const [dataSource, setDataSource] = useState(null)
    const [config, setConfig] = useState({
        row: 3,
        column: 4
    })
    const [configShow, setConfigShow] = useState(false)
    const [styleConfig, setStyleConfig] = useState({
        basicWidth: 80,
        basicHeight: 40
    })
    const [historyState, setHistoryState] = useState({
        backDisabled: true,
        forwardDisabled: true
    })
    const [scaleRange, setScaleRange] = useState(100)
    useEffect(() => {
        initTable(config.row, config.column)
    }, [config])

    const [colWidthList, setColWidthList] = useState([])
    const [rowHeightList, setRowHeightList] = useState([])
    /* useEffect(() => {
        console.log(colWidthList, rowHeightList);
    }, [colWidthList, rowHeightList]) */
    const initTable = (row, column) => {
        let initMatrix = [], rowArr = [], colArr = []
        for (let i = 0; i < row; i++) {
            rowArr.push(styleConfig.basicHeight)
            for (let j = 0; j < column; j++) {
                initMatrix.push({
                    id: j + '-' + i,
                    column: j,
                    colSpan: 1,
                    row: i,
                    rowSpan: 1,
                    selected: false
                })
            }
        }
        for (let i = 0; i < column; i++) {
            colArr.push(styleConfig.basicWidth)
        }
        // return console.log(rowArr,colArr);
        setRowHeightList(rowArr)
        setColWidthList(colArr)
        setDataSource(initMatrix)
        headerRef.current && headerRef.current.saveAsHistory(initMatrix)
    }

    const handleMouseUp = () => {
        headerRef.current && headerRef.current.handleTempletMouseUp()
    }

    const clickBlankspace = (e) => {
        if (e.target === document.getElementById('theader-templet')) {
            headerRef.current && headerRef.current.initCells()
            setColWidth(-1)
            setRowHeight(-1)
        }
    }

    const historyChange = (state) => {
        setHistoryState(state)
    }

    const handleMerge = () => headerRef.current.mergeSelectedCells()
    const handleSplit = () => headerRef.current.splitSelectedCells()
    const handleBack = () => headerRef.current.backHistory()
    const handleForward = () => headerRef.current.forwardHistory()
    const handleCleanUp = () => headerRef.current.saveAsHistory([])
    const handleRangeChange = e => {
        setScaleRange(e.target.value)
        setStyleConfig({
            ...styleConfig,
            scale: Number(e.target.value) / 100
        })
    }

    const TableConfigModal = ({ show, config, onSubmit }) => {
        const [row, setRow] = useState(config.row)
        const [column, setColumn] = useState(config.column)
        const generateTable = () => {
            let constraintedRow = Number(constrainter(row, 1, 20))
            let constraintedColumn = Number(constrainter(column, 1, 20))
            setRow(constraintedRow)
            setColumn(constraintedColumn)
            if (constraintedRow != config.row || constraintedColumn != config.column) {
                // return console.log({ row: constraintedRow, column: constraintedColumn });
                onSubmit({ row: constraintedRow, column: constraintedColumn })
            }
        }
        const constrainter = (number, min, max) => {
            return number > max ? max : (number < min ? min : number)
        }
        return (
            <div className={`table-config-modal ${show ? "show" : null}`}>
                <label>行</label>
                <input value={row} onChange={e => setRow(e.target.value)} />
                <label>列</label>
                <input value={column} onChange={e => setColumn(e.target.value)} />
                {/* <label>单元格宽</label>
                <input name="basicWidth" value={styleConfig.basicWidth} onChange={handleChange} />
                <label>单元格高</label>
                <input name="basicHeight" value={styleConfig.basicHeight} onChange={handleChange} /> */}
                <button onClick={generateTable}>生成新表格</button>
            </div>
        )
    }
    const showConfig = () => {
        setConfigShow(!configShow)
    }
    const [selectedRowOrColumn, setSelectedRowOrColumn] = useState({
        row: -1,
        column: -1
    })
    const [rowHeight, setRowHeight] = useState(-1)
    const [colWidth, setColWidth] = useState(-1)
    const handleChangeList = e => {
        if (selectedRowOrColumn.row >= 0) {
            setRowHeight(e.target.value)
        } else if (selectedRowOrColumn.column >= 0) {
            setColWidth(e.target.value)
        }
    }
    const handleSet = () => {
        let list = []
        if (selectedRowOrColumn.row >= 0) {
            list = [...rowHeightList]
            let value = rowHeight > 100 ? 100 : (rowHeight < 20 ? 20 : rowHeight)
            setRowHeight(value)
            list[selectedRowOrColumn.row] = Number(value)
            setRowHeightList(list)
        } else if (selectedRowOrColumn.column >= 0) {
            list = [...colWidthList]
            let value = colWidth > 200 ? 200 : (colWidth < 40 ? 40 : colWidth)
            setColWidth(value)
            list[selectedRowOrColumn.column] = Number(value)
            setColWidthList(list)
        }
    }
    const handleToolClick = ({ row, column, left, top }) => {
        setRowHeight(row >= 0 ? rowHeightList[row] : -1)
        setColWidth(column >= 0 ? colWidthList[column] : -1)
        setSelectedRowOrColumn({ row, column })
    }
    const [cellColorShow, setCellColorShow] = useState(false)
    const [fontColorShow, setFontColorShow] = useState(false)
    const [cellColor, setCellColor] = useState('#FFFFFF')
    const [fontColor, setFontColor] = useState('#000000')
    return (
        <div className="templet">
            <div className="justify-center">
                <button onClick={handleMerge}>合并单元格</button>
                <button onClick={handleSplit}>取消单元格合并</button>
                {/* <button onClick={handleSelect}>选中单元格</button> */}
                <button
                    disabled={historyState.backDisabled}
                    onClick={handleBack}>
                    ↩️
                </button>
                <button
                    disabled={historyState.forwardDisabled}
                    onClick={handleForward}>
                    ↪️
                </button>
            </div>
            <div className="justify-center">
                <div className="display-column left-options-contianer">
                    <button title="配置表格" onClick={showConfig}>📅</button>
                    <TableConfigModal
                        show={configShow}
                        config={config}
                        onSubmit={setConfig} />
                    <button onClick={handleCleanUp} title="清空内容">❌</button>
                </div>
                <div
                    className="header-box"
                    onMouseUp={handleMouseUp}>
                    <div
                        id="theader-templet"
                        className="inner-box"
                        onClick={clickBlankspace}>
                        {
                            dataSource ?
                                <RefHeader
                                    styleConfig={styleConfig}
                                    dataSource={dataSource}
                                    ref={headerRef}
                                    historyChange={historyChange}
                                    colWidthList={colWidthList}
                                    rowHeightList={rowHeightList}
                                    toolClick={handleToolClick}
                                /> : ''
                        }
                    </div>
                </div>
                <div className="display-column right-tool-bar">
                    <button
                        onClick={() => { setCellColorShow(false); setFontColorShow(!fontColorShow) }}>
                        设置字体颜色
                    </button>
                    <div className={`invisible font-color-picker ${fontColorShow ? 'show' : null}`}>
                        <CompactPicker
                            color={fontColor}
                            onChange={(color) => {
                                headerRef.current.setFontStyleToSelectedCells({ color: color.hex })
                                setFontColor(color.hex)
                            }} />
                    </div>
                    <button
                        onClick={() => { setCellColorShow(!cellColorShow); setFontColorShow(false) }}>
                        设置单元格背景色
                    </button>
                    <div className={`invisible cell-color-picker ${cellColorShow ? 'show' : null}`}>
                        <CompactPicker
                            color={cellColor}
                            onChange={(color) => {
                                headerRef.current.setFontStyleToSelectedCells({ backgroundColor: color.hex })
                                setCellColor(color.hex)
                            }} />
                    </div>
                    <div className="justify-spacebetween">
                        <input
                            type="number"
                            min={20}
                            max={100}
                            placeholder="行高"
                            onChange={handleChangeList}
                            value={rowHeight > 0 ? rowHeight : ''}
                            disabled={rowHeight < 0} />
                        <button
                            disabled={rowHeight < 0}
                            onClick={handleSet}>
                            设置
                        </button>
                    </div>
                    <div className="justify-spacebetween">
                        <input
                            type="number"
                            min={40}
                            max={200}
                            placeholder="列宽"
                            onChange={handleChangeList}
                            value={colWidth > 0 ? colWidth : ''}
                            disabled={colWidth < 0} />
                        <button
                            disabled={colWidth < 0}
                            onClick={handleSet}>
                            设置
                        </button>
                    </div>
                </div>
            </div>
            <div className="justify-center">
                <input
                    value={scaleRange}
                    type="range"
                    min={50}
                    max={100}
                    onChange={handleRangeChange} />
                <label>{scaleRange}%</label>
            </div>
        </div>
    )
}

export default TheadDesigner