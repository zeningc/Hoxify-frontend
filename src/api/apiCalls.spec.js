import axios from 'axios';
import * as apiCalls from './apiCalls'

describe('apiCalls', () => {
  describe('signup', () => {
    it('calls /api/1.0/users', () => {
      const mockSignup = jest.fn();
      axios.post = mockSignup;
      apiCalls.signup();
      const path = mockSignup.mock.calls[0][0];
      expect(path).toBe('/api/1.0/users');
    });

    it('calls /api/1.0/login', () => {
      const mockLogin = jest.fn();
      axios.post = mockLogin;
      apiCalls.login();
      const path = mockLogin.mock.calls[0][0];
      expect(path).toBe('/api/1.0/login');
    });
  })
})