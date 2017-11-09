let React = require('react');

export const validate = values => {
  const errors = {};
  /* if (!values.username) {
    errors.clubName = 'Required';
  } else if (!values.display) {
    errors.clubName = 'Required';
  } else if (!values.password) {
    errors.clubName = 'Required';
  } else if (!values.clicks) {
    errors.clubName = 'Required';
  } */
  if (!values.users || !values.users.length) {
    errors.users = { _error: 'At least one user must be entered' };
  } else {
    const usersArrayErrors = [];
    values.users.forEach((user, userIndex) => {
      const userErrors = {};
      if (!user || !user.username) {
        userErrors.username = 'Required';
        usersArrayErrors[userIndex] = userErrors;
      }
      if (!user || !user.display) {
        userErrors.display = 'Required';
        usersArrayErrors[userIndex] = userErrors;
      }
      if (!user || !user.password) {
        userErrors.password = 'Required';
        usersArrayErrors[userIndex] = userErrors;
      }
      if (!user || !user.clicks) {
        userErrors.clicks = 'Required';
        usersArrayErrors[userIndex] = userErrors;
      }
      if (user && user.datas && user.datas.length) {
        const dataArrayErrors = [];
        user.datas.forEach((data, dataIndex) => {
          if (!data || !data.length) {
            dataArrayErrors[dataIndex] = 'Required';
          }
        });
        if (dataArrayErrors.length) {
          userErrors.datas = dataArrayErrors;
          usersArrayErrors[userIndex] = userErrors;
        }
        if (user.datas.length > 5) {
          if (!userErrors.datas) {
            userErrors.datas = [];
          }
          
          userErrors.datas._error = 'No more than five datas or names allowed';
          
          usersArrayErrors[userIndex] = userErrors;
        }
      }
    });
    if (usersArrayErrors.length) {
      errors.users = usersArrayErrors;
    }
  }
  return errors;
};

export const renderField = ({ input, label, type, meta: { touched, error } }) => (
  <div>
    <label>{label}</label>
    <div>
      <input {...input} type={type} placeholder={label} className="form-control" />
      {touched && error && <span>{error}</span>}
    </div>
  </div>
);

// export default validate;
renderField.propTypes = {
  input: React.PropTypes.object,
  label: React.PropTypes.string,
  type: React.PropTypes.string,
  meta: React.PropTypes.object,
};