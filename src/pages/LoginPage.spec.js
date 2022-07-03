import React from "react";
import { queryByPlaceholderText, render, waitFor, waitForElementToBeRemoved } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import { LoginPage } from './LoginPage'

describe('LoginPage', () => {
  describe('Layout', () => {
    it('has header of Login', () => {
      const { container } = render(<LoginPage />);
      const header = container.querySelector('h1');
      expect(header).toHaveTextContent('Login');
    });

    it('has input for username', () => {
      const { queryByPlaceholderText } = render(<LoginPage />);
      const usernameInput = queryByPlaceholderText('Your username');
      expect(usernameInput).toBeInTheDocument();
    });

    it('has input for password', () => {
      const { queryByPlaceholderText } = render(<LoginPage />);
      const passwordInput = queryByPlaceholderText('Your password');
      expect(passwordInput).toBeInTheDocument();
    });

    it('has password type for password input for password', () => {
      const { queryByPlaceholderText } = render(<LoginPage />);
      const passwordInput = queryByPlaceholderText('Your password');
      expect(passwordInput.type).toBe('password');
    });

    it('has login button', () => {
      const { container } = render(<LoginPage />);
      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
    });
  });
  describe('Interactions', () => {
    const changeEvent = (content) => {
      return {
        target: {
          value: content
        }
      };
    };
    it('sets the username value into state', () => {
      const { queryByPlaceholderText } = render(<LoginPage />);
      const usernameInput = queryByPlaceholderText('Your username');
      fireEvent.change(usernameInput, changeEvent('my-username'));
      expect(usernameInput).toHaveValue('my-username');
    });

    it('sets the password value into state', () => {
      const { queryByPlaceholderText } = render(<LoginPage />);
      const passwordInput = queryByPlaceholderText('Your password');
      fireEvent.change(passwordInput, changeEvent('P4ssword'));
      expect(passwordInput).toHaveValue('P4ssword');
    });

    let usernameInput, passwordInput, button;

    const setupForSubmit = (props) => {
      const rendered = render(<LoginPage {...props} />);
      const { container, queryByPlaceholderText } = rendered;
      usernameInput = queryByPlaceholderText('Your username');
      fireEvent.change(usernameInput, changeEvent('my-username'));
      passwordInput = queryByPlaceholderText('Your password');
      fireEvent.change(passwordInput, changeEvent('P4ssword'));
      button = container.querySelector('button');

      return rendered;
    }

    it('calls postLogin when the actions are provided in props and input fields have value', () => {
      const actions = {
        postLogin: jest.fn().mockResolvedValue({})
      };

      setupForSubmit({ actions });
      fireEvent.click(button);
      expect(actions.postLogin).toHaveBeenCalledTimes(1);
    });
    it('does not throw exception when clicking the button when actions not provided in props', () => {
      setupForSubmit();
      expect(() => fireEvent.click(button)).not.toThrow();
    });
    it('calls postLogin with credentials in body', () => {
      const actions = {
        postLogin: jest.fn().mockResolvedValue({})
      };
      setupForSubmit({ actions });
      fireEvent.click(button);

      const expectedUserObject = {
        username: 'my-username',
        password: 'P4ssword'
      };

      expect(actions.postLogin).toHaveBeenCalledWith(expectedUserObject);
    });

    it('enables the button when username and password is not empty', () => {
      setupForSubmit();
      expect(button).not.toBeDisabled();
    });

    it('disables the button when username is empty', () => {
      setupForSubmit();
      fireEvent.change(usernameInput, changeEvent(''));
      expect(button).toBeDisabled();
    });

    it('disables the button when password is empty', () => {
      setupForSubmit();
      fireEvent.change(passwordInput, changeEvent(''));
      expect(button).toBeDisabled();
    });

    it('display alert when login fails', async () => {
      const actions = {
        postLogin: jest.fn().mockRejectedValue({
          response: {
            data: {
              message: 'Login failed'
            }
          }
        })
      };
      const { queryByText } = setupForSubmit({ actions });
      fireEvent.click(button);
      await waitFor(() => {
        expect(queryByText('Login failed')).toBeInTheDocument();
      });
    });

    it('clears alert when user changes username', async () => {
      const actions = {
        postLogin: jest.fn().mockRejectedValue({
          response: {
            data: {
              message: 'Login failed'
            }
          }
        })
      };
      const { queryByText } = setupForSubmit({ actions });
      fireEvent.click(button);
      await waitFor(() => {
        queryByText('Login failed');
      });
      const alert = queryByText('Login failed');
      fireEvent.change(usernameInput, changeEvent('updated-username'));
      expect(alert).not.toBeInTheDocument();
    });

    it('clears alert when user changes password', async () => {
      const actions = {
        postLogin: jest.fn().mockRejectedValue({
          response: {
            data: {
              message: 'Login failed'
            }
          }
        })
      };
      const { queryByText } = setupForSubmit({ actions });
      fireEvent.click(button);
      await waitFor(() => {
        queryByText('Login failed');
      });
      const alert = queryByText('Login failed');
      fireEvent.change(passwordInput, changeEvent('updated-username'));
      expect(alert).not.toBeInTheDocument();
    });

    const mockAsyncDelayed = () => {
      return jest.fn().mockImplementationOnce(() => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve({});
          }, 300);
        });
      })
    };

    it('does not allow user to click the Login button when there is an ongoing api call', () => {
      const actions = {
        postLogin: mockAsyncDelayed()
      }
      setupForSubmit({ actions });
      fireEvent.click(button);
      fireEvent.click(button);
      expect(actions.postLogin).toHaveBeenCalledTimes(1);
    });

    it('displays spinner when there is an ongoing api call', () => {
      const actions = {
        postLogin: mockAsyncDelayed()
      }
      const { queryByText } = setupForSubmit({ actions });
      fireEvent.click(button);

      const spinner = queryByText('Loading...');
      expect(spinner).toBeInTheDocument();
    });

    it('hides spinner after api call finishes successfully', async () => {
      const actions = {
        postLogin: mockAsyncDelayed()
      }
      const { queryByText } = setupForSubmit({ actions });
      fireEvent.click(button);
      const spinner = queryByText('Loading...');
      await waitForElementToBeRemoved(spinner);
      expect(spinner).not.toBeInTheDocument();
    });

    it('hides spinner after api call finishes with error', async () => {
      const actions = {
        postLogin: jest.fn().mockImplementation(() => {
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              reject({
                response: { data: {} }
              });
            }, 300);
          })
        })
      }
      const { queryByText } = setupForSubmit({ actions });
      fireEvent.click(button);
      const spinner = queryByText('Loading...');
      await waitForElementToBeRemoved(spinner);
      expect(spinner).not.toBeInTheDocument();
    });

    it('redirects to homePage after successful login', async () => {
      const actions = {
        postLogin: jest.fn().mockResolvedValue({})
      };
      const history = {
        push: jest.fn()
      };

      setupForSubmit({ actions, history });
      fireEvent.click(button);
      await waitFor(() => expect(history.push).toHaveBeenCalledWith('/'));
    });

  });

})