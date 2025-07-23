// Response utility functions for consistent API responses

const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
  const response = {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  };
  
  return res.status(statusCode).json(response);
};

const errorResponse = (res, message = 'Internal Server Error', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString()
  };
  
  if (errors) {
    response.errors = errors;
  }
  
  return res.status(statusCode).json(response);
};

const validationErrorResponse = (res, errors) => {
  const response = {
    success: false,
    message: 'Validation Error',
    errors: errors.array ? errors.array() : errors,
    timestamp: new Date().toISOString()
  };
  
  return res.status(400).json(response);
};

const paginatedResponse = (res, data, pagination, message = 'Data retrieved successfully') => {
  const response = {
    success: true,
    message,
    data,
    pagination,
    timestamp: new Date().toISOString()
  };
  
  return res.status(200).json(response);
};

export {
  successResponse,
  errorResponse,
  validationErrorResponse,
  paginatedResponse
};
