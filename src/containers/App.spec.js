import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from './App'
import { Provider } from 'react-redux'
import axios from "axios";
import configureStore from "../redux/configureStore";

beforeEach(() => {
  localStorage.clear();
  delete axios.defaults.headers.common['Authorization'];
});

const defaultState = {
  id: 0,
  username: '',
  displayName: '',
  image: '',
  password: '',
  isLoggedIn: false
}

const store = configureStore(false);
const changeEvent = (content) => {
  return {
    target: {
      value: content
    }
  };
};
const setup = (path) => {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </Provider>
  );
}
describe('App', () => {
  it('displays homepage when url is /', () => {
    const { queryByTestId } = setup('/');
    expect(queryByTestId('homepage')).toBeInTheDocument();
  });

  it('displays LoginPage when url is /login', () => {
    const { container } = setup('/login');
    const header = container.querySelector('h1');
    expect(header).toHaveTextContent('Login');
  });

  it('displays only LoginPage page when url is /login', () => {
    const { queryByTestId } = setup('/login');
    expect(queryByTestId('homepage')).not.toBeInTheDocument();
  });

  it('displays UserSignupPage when url is /signup', () => {
    const { container } = setup('/signup');
    const header = container.querySelector('h1');
    expect(header).toBeInTheDocument();
  });


  it('displays userpage when url is other than /, /login or /signup', () => {
    const { queryByTestId } = setup('/user1');
    expect(queryByTestId('userpage')).toBeInTheDocument();
  });

  it('displays topBar when url is /', () => {
    const { container } = setup('/');
    const navigation = container.querySelector('nav');
    expect(navigation).toBeInTheDocument();
  });

  it('displays topBar when url is /login', () => {
    const { container } = setup('/login');
    const navigation = container.querySelector('nav');
    expect(navigation).toBeInTheDocument();
  });

  it('displays topBar when url is /signup', () => {
    const { container } = setup('/signup');
    const navigation = container.querySelector('nav');
    expect(navigation).toBeInTheDocument();
  });

  it('displays topBar when url is /user1', () => {
    const { container } = setup('/user1');
    const navigation = container.querySelector('nav');
    expect(navigation).toBeInTheDocument();
  });

  it('shows the UserSignupPage when clicking signup', () => {
    const { queryByText, container } = setup('/');
    const signupLink = queryByText('Sign Up');
    fireEvent.click(signupLink);
    const header = container.querySelector('h1');
    expect(header).toHaveTextContent('Sign Up');
  });

  it('shows the LoginPage when clicking login', () => {
    const { queryByText, container } = setup('/');
    const loginLink = queryByText('Login');
    fireEvent.click(loginLink);
    const header = container.querySelector('h1');
    expect(header).toHaveTextContent('Login');
  });

  it('shows the HomePage when clicking the logo', () => {
    const { queryByTestId, container } = setup('/');
    const signupLink = container.querySelector('img');
    fireEvent.click(signupLink);
    expect(queryByTestId('homepage')).toBeInTheDocument();
  });

  it('displays My Profile on TopBar after login success', async () => {
    const { queryByPlaceholderText, container, queryByText } = setup('/login');
    const changeEvent = (content) => {
      return {
        target: {
          value: content
        }
      };
    };
    const usernameInput = queryByPlaceholderText('Your username');
    fireEvent.change(usernameInput, changeEvent('user1'));
    const passwordInput = queryByPlaceholderText('Your password');
    fireEvent.change(passwordInput, changeEvent('P4ssword'));
    const button = container.querySelector('button');
    axios.post = jest.fn().mockResolvedValue({
      data: {
        id: 1,
        username: 'user1',
        displayName: 'display1',
        image: 'profile1.png'
      }
    });

    fireEvent.click(button);
    await waitFor(() => queryByText('My Profile'));
    const myProfileLink = queryByText('My Profile');
    expect(myProfileLink).toBeInTheDocument();
  });

  it('displays My Profile on TopBar after signup success', async () => {
    const { queryByPlaceholderText, container, queryByText } = setup('/signup');
    const displayNameInput = queryByPlaceholderText('Your display name');
    const usernameInput = queryByPlaceholderText('Your username');
    const passwordInput = queryByPlaceholderText('Your password');
    const passwordRepeat = queryByPlaceholderText('Repeat your password');

    fireEvent.change(displayNameInput, changeEvent('display1'));
    fireEvent.change(usernameInput, changeEvent('user1'));
    fireEvent.change(passwordInput, changeEvent('P4ssword'));
    fireEvent.change(passwordRepeat, changeEvent('P4ssword'));

    const button = container.querySelector('button');
    axios.post = jest
      .fn()
      .mockResolvedValueOnce({
        data: {
          message: 'User saved'
        }
      })
      .mockResolvedValueOnce({
        data: {
          id: 1,
          username: 'user1',
          displayName: 'display1',
          image: 'profile1.png'
        }
      });

    fireEvent.click(button);
    await waitFor(() => queryByText('My Profile'));
    const myProfileLink = queryByText('My Profile');
    expect(myProfileLink).toBeInTheDocument();
  });

  it('saves logged in user data to localStorage after login success', async () => {
    const { queryByPlaceholderText, container, queryByText } = setup('/signup');
    const displayNameInput = queryByPlaceholderText('Your display name');
    const usernameInput = queryByPlaceholderText('Your username');
    const passwordInput = queryByPlaceholderText('Your password');
    const passwordRepeat = queryByPlaceholderText('Repeat your password');

    fireEvent.change(displayNameInput, changeEvent('display1'));
    fireEvent.change(usernameInput, changeEvent('user1'));
    fireEvent.change(passwordInput, changeEvent('P4ssword'));
    fireEvent.change(passwordRepeat, changeEvent('P4ssword'));

    const button = container.querySelector('button');
    axios.post = jest
      .fn()
      .mockResolvedValueOnce({
        data: {
          message: 'User saved'
        }
      })
      .mockResolvedValueOnce({
        data: {
          id: 1,
          username: 'user1',
          displayName: 'display1',
          image: 'profile1.png'
        }
      });

    fireEvent.click(button);
    await waitFor(() => queryByText('My Profile'));
    const dataInstorage = JSON.parse(localStorage.getItem('hoxify-auth'));
    expect(dataInstorage).toEqual({
      id: 1,
      username: 'user1',
      displayName: 'display1',
      image: 'profile1.png',
      password: 'P4ssword',
      isLoggedIn: true
    });
  });

  it('displays logged in topBar when storage when storage has logged in user data', () => {
    localStorage.setItem('hoxify-auth', JSON.stringify({
      id: 1,
      username: 'user1',
      displayName: 'display1',
      image: 'profile1.png',
      password: 'P4ssword',
      isLoggedIn: true
    }));

    const { queryByText } = setup('/');
    const myProfileLink = queryByText('My Profile');
    expect(myProfileLink).toBeInTheDocument();
  });

  it('sets axios authorization with base64 encoded user credentials after login success', async () => {
    const { queryByPlaceholderText, container, queryByText } = setup('/signup');
    const displayNameInput = queryByPlaceholderText('Your display name');
    const usernameInput = queryByPlaceholderText('Your username');
    const passwordInput = queryByPlaceholderText('Your password');
    const passwordRepeat = queryByPlaceholderText('Repeat your password');

    fireEvent.change(displayNameInput, changeEvent('display1'));
    fireEvent.change(usernameInput, changeEvent('user1'));
    fireEvent.change(passwordInput, changeEvent('P4ssword'));
    fireEvent.change(passwordRepeat, changeEvent('P4ssword'));

    const button = container.querySelector('button');
    axios.post = jest
      .fn()
      .mockResolvedValueOnce({
        data: {
          message: 'User saved'
        }
      })
      .mockResolvedValueOnce({
        data: {
          id: 1,
          username: 'user1',
          displayName: 'display1',
          image: 'profile1.png'
        }
      });

    fireEvent.click(button);
    await waitFor(() => queryByText('My Profile'));
    const axiosAuthorization = axios.defaults.headers.common['Authorization'];
    const encoded = btoa('user1:P4ssword');
    const expectedAuthorization = `Basic ${encoded}`;
    expect(axiosAuthorization).toBe(expectedAuthorization);
  });

  it('sets axios authorization with base64 encoded user credentials when storage has logged in user data', () => {
    localStorage.setItem(
      'hoxify-auth',
      JSON.stringify({
        id: 1,
        username: 'user1',
        displayName: 'display1',
        image: 'profile1.png',
        password: 'P4ssword',
        isLoggedIn: true
      })
    );
    setup('/');
    const axiosAuthorization = axios.defaults.headers.common['Authorization'];
    const encoded = btoa('user1:P4ssword');
    const expectedAuthorization = `Basic ${encoded}`;
    expect(axiosAuthorization).toBe(expectedAuthorization);
  });
  it('removes axios authorization header when user logout', async () => {
    localStorage.setItem(
      'hoxify-auth',
      JSON.stringify({
        id: 1,
        username: 'user1',
        displayName: 'display1',
        image: 'profile1.png',
        password: 'P4ssword',
        isLoggedIn: true
      })
    );
    const { queryByText } = setup('/');
    fireEvent.click(queryByText('Logout'));

    const axiosAuthorization = axios.defaults.headers.common['Authorization'];
    expect(axiosAuthorization).toBeFalsy();
  });
});
