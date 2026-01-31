// List Skeleton - Loading state component for table and card views
import React from 'react';
import PropTypes from 'prop-types';

export const ListSkeleton = ({ rows = 5, type = 'table', variant = 'default' }) => {
  if (type === 'card') {
    return (
      <div className="row row-cards">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="col-md-6 col-lg-4 mb-3">
            <div className="card placeholder-glow">
              <div className="card-body">
                <div className="placeholder placeholder-lg col-12 mb-3"></div>
                <div className="placeholder col-8 mb-2"></div>
                <div className="placeholder col-6 mb-2"></div>
                <div className="placeholder col-4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="list-group list-group-flush placeholder-glow">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="list-group-item">
            <div className="row align-items-center">
              <div className="col-auto">
                <div className="avatar placeholder"></div>
              </div>
              <div className="col">
                <div className="placeholder col-8 mb-2"></div>
                <div className="placeholder col-6"></div>
              </div>
              <div className="col-auto">
                <div className="placeholder col-4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Default: table skeleton
  return (
    <div className="table-responsive">
      <table className="table table-vcenter card-table placeholder-glow">
        <thead>
          <tr>
            <th><div className="placeholder col-8"></div></th>
            <th><div className="placeholder col-6"></div></th>
            <th><div className="placeholder col-6"></div></th>
            <th><div className="placeholder col-4"></div></th>
            <th className="w-1"></th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, index) => (
            <tr key={index}>
              <td>
                <div className="d-flex align-items-center">
                  <span className="avatar avatar-sm placeholder me-2"></span>
                  <div className="flex-fill">
                    <div className="placeholder col-10 mb-1"></div>
                    <div className="placeholder col-8"></div>
                  </div>
                </div>
              </td>
              <td><div className="placeholder col-9"></div></td>
              <td><div className="placeholder col-7"></div></td>
              <td><div className="placeholder col-6"></div></td>
              <td><div className="placeholder col-4"></div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

ListSkeleton.propTypes = {
  rows: PropTypes.number,
  type: PropTypes.oneOf(['table', 'card', 'list']),
  variant: PropTypes.string,
};
