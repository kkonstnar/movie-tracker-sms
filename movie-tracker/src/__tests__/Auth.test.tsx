import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Auth from '../pages/Auth';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

// Mock modules
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
    },
  },
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useNavigate: () => vi.fn(),
}));

describe('Auth Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderAuth = () => {
    return render(
      <BrowserRouter>
        <Auth />
      </BrowserRouter>
    );
  };

  it('renders sign in form by default', () => {
    renderAuth();
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('switches between sign in and sign up modes', () => {
    renderAuth();
    
    // Initially in sign in mode
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
    
    // Switch to sign up mode
    fireEvent.click(screen.getByText(/don't have an account\? sign up/i));
    expect(screen.getByText('Create your account')).toBeInTheDocument();
    
    // Switch back to sign in mode
    fireEvent.click(screen.getByText(/already have an account\? sign in/i));
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
  });

  it('handles successful sign up', async () => {
    vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({
      data: { user: { id: 'test-id' }, session: null },
      error: null,
    });

    renderAuth();
    
    // Switch to sign up mode
    fireEvent.click(screen.getByText(/don't have an account\? sign up/i));
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    
    // Submit the form
    fireEvent.click(screen.getByText('Sign up'));
    
    await waitFor(() => {
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(toast.success).toHaveBeenCalledWith('Account created successfully! Please sign in.');
    });
  });

  it('handles successful sign in', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
      data: { user: { id: 'test-id' }, session: { access_token: 'token' } },
      error: null,
    });

    renderAuth();
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    
    // Submit the form
    fireEvent.click(screen.getByText('Sign in'));
    
    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(toast.success).toHaveBeenCalledWith('Signed in successfully!');
    });
  });

  it('handles sign up validation errors', async () => {
    vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({
      data: { user: null, session: null },
      error: new Error('Invalid email format'),
    });

    renderAuth();
    
    // Switch to sign up mode
    fireEvent.click(screen.getByText(/don't have an account\? sign up/i));
    
    // Fill in the form with invalid data
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'invalid-email' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'short' },
    });
    
    // Submit the form
    fireEvent.click(screen.getByText('Sign up'));
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Invalid email format');
    });
  });

  it('handles sign in validation errors', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
      data: { user: null, session: null },
      error: new Error('Invalid login credentials'),
    });

    renderAuth();
    
    // Fill in the form with invalid credentials
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'wrong@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrongpassword' },
    });
    
    // Submit the form
    fireEvent.click(screen.getByText('Sign in'));
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Invalid login credentials');
    });
  });

  it('disables form submission while loading', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(resolve, 1000))
    );

    renderAuth();
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    
    // Submit the form
    fireEvent.click(screen.getByText('Sign in'));
    
    // Button should be disabled and show loading state
    const submitButton = screen.getByText('Loading...');
    expect(submitButton).toBeDisabled();
  });
});