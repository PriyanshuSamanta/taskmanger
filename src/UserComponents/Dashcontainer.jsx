import React, { useMemo, useState, useEffect } from 'react';
import { useTable, useGlobalFilter, usePagination } from 'react-table';
import { FaChevronLeft, FaChevronRight, FaAngleDoubleLeft, FaAngleDoubleRight } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment } from '@fortawesome/free-solid-svg-icons';
import 'font-awesome/css/font-awesome.min.css';
import '../css/usermain.css';
import axios from 'axios';
import Singletask from './TaskCard';
import AddTaskPopup from './AddTaskPopup';

const Dashcontainer = () => {
  const [taskData, setTaskData] = useState([]);
  const [filterInput, setFilterInput] = useState('');
   const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:5001/api/usertasks', { withCredentials: true })
  .then(res => setTaskData(res.data))
  .catch(err => console.error('Fetch error:', err));
  }, []);

  const columns = useMemo(() => [
    { Header: "Task ID", accessor: "task_id" },
    { Header: "Task Name", accessor: "task_name" },
    {
      Header: "Comment",
      accessor: "comment",
      Cell: ({ row }) => {
        let commentArray = [];
        const rawComment = row.original.comment;

        if (typeof rawComment === 'string') {
          try {
            const parsed = JSON.parse(rawComment);
            commentArray = Array.isArray(parsed) ? parsed : [parsed];
          } catch {
            commentArray = rawComment ? [rawComment] : [];
          }
        } else if (Array.isArray(rawComment)) {
          commentArray = rawComment;
        } else if (rawComment) {
          commentArray = [rawComment];
        }
        const commentCount = commentArray.length;
          return (
            <div className="text-center">
              <button className="relative">
                <FontAwesomeIcon icon={faComment} />
                {commentCount > 0 && (
                  <span className="absolute bottom-4 left-3 bg-gray-600 text-white rounded-full text-[0.45rem] px-1">
                    {commentCount}
                  </span>
                )}
              </button>
            </div>
          );
        },
      },
    {
    Header: "Status",
    accessor: "status",
    Cell: ({ value, row }) => {
      let bgColor = "transparent";
      if (value === "To Do") bgColor = "#fde68a";
      else if (value === "Doing") bgColor = "#bfdbfe";
      else if (value === "Done") bgColor = "#bbf7d0";
          return (
            <div
              style={{
                fontSize: '12px',
                borderRadius: '10px',
                textAlign: 'center',
                padding: '1px 10px',
                backgroundColor: bgColor,
                }}
              >
              {value}
            </div>
        );
      },
    },
    {
    Header: "Priority",
    accessor: "priority",
    Cell: ({ value }) => {
      let bgColor = "transparent";
      let textColor = "inherit";
      if (value === "Low") {
        bgColor = "#d1fae5"; // green-100
      } else if (value === "Urgent") {
        bgColor = "#f87171"; // red-400
        textColor = "white";
      }
        return (
          <div
            style={{
              fontSize: '12px',
              textAlign: 'center',
            borderRadius: '10px',
            backgroundColor: bgColor,
            color: textColor,
            }}
          >
            {value}
          </div>
        );
      }
    },
    { Header: "Submission Date", accessor: "submission_date" },
    { Header: "Deadline", accessor: "due_date" },
    { Header: "Project ID", accessor: "project_id" },
  ], []);

  const {
    getTableProps, getTableBodyProps, headerGroups, prepareRow, page,
    state, nextPage, previousPage, canNextPage, canPreviousPage, pageCount,
    gotoPage, pageOptions, setPageSize, setGlobalFilter
  } = useTable(
    { columns, data: taskData, initialState: { pageIndex: 0, pageSize: 20 } },
    useGlobalFilter,
    usePagination
  );

  const { pageIndex, pageSize } = state;

  return (
    <div className="container-dash  pt-5 px-6  ">
      <div className="d-flex justify-content-center mb-6">
        <div className="search shadow-xl">
          <input
            className="search_input"
            type="text"
            placeholder="Search here..."
            value={filterInput}
            onChange={e => {
              setGlobalFilter(e.target.value);
              setFilterInput(e.target.value);
            }}
          />
          <a href="#/" className="search_icon" onClick={e => e.preventDefault()}>
            <i className="fa fa-search"></i>
          </a>
          
        </div>
        
      </div>

      <div className='text-right mb-4 mr-3 font-semibold text-gray-500'>
        <button
          onClick={() => setShowPopup(true)}
          className='bg-white p-4 pt-1 pb-1 rounded shadow-xl'
        >
          <span className='text-red-400 text-lg'>+</span> Add Task
        </button>
      </div>
      {showPopup && <AddTaskPopup onClose={() => setShowPopup(false)} />}

      <div className='flex'>
        <div className=''>
          <div className="overflow-x-auto bg-white rounded-lg shadow w-full shadow-xl">
            <table {...getTableProps()} className="min-w-full divide-y divide-gray-200 ">
              <thead className="bg-gray-50">
                {headerGroups.map(headerGroup => (
                  <tr key={headerGroup.id} {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map(column => {
                      const { key, ...restProps } = column.getHeaderProps();
                      return (
                        <th key={key} {...restProps} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {column.render("Header")}
                        </th>
                      );
                    })}
                  </tr>
                ))}
              </thead>
              <tbody {...getTableBodyProps()} className="divide-y divide-gray-200">
                {page.map((row, idx) => {
                  prepareRow(row);
                  const { key, ...rowProps } = row.getRowProps(); 
                  return (
                    <tr key={key} {...rowProps} className="hover:bg-gray-50">
                      {row.cells.map(cell => {
                        const { key: cellKey, ...cellProps } = cell.getCellProps(); 
                        return (
                          <td key={cellKey} {...cellProps} className="px-6 py-3 text-xs text-gray-700 whitespace-nowrap">
                            {cell.render('Cell')}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-white ">Page {pageIndex + 1} of {pageOptions.length}</div>
            <div className="flex items-center space-x-2">
              <button onClick={() => gotoPage(0)} disabled={!canPreviousPage} className="p-2 text-white"><FaAngleDoubleLeft /></button>
              <button onClick={() => previousPage()} disabled={!canPreviousPage} className="p-2 text-white"><FaChevronLeft /></button>
              <button onClick={() => nextPage()} disabled={!canNextPage} className="p-2 text-white"><FaChevronRight /></button>
              <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage} className="p-2 text-white"><FaAngleDoubleRight /></button>
            </div>
            <select
              value={pageSize}
              onChange={e => setPageSize(Number(e.target.value))}
              className="p-1 rounded bg-white text-xs shadow-xl"
            >
              {[20, 50, 100].map(size => (
                <option key={size} value={size}>Show {size}</option>
              ))}
            </select>
          </div>
       </div>
       <Singletask />


      </div>
    </div>
  );
};

export default Dashcontainer;
