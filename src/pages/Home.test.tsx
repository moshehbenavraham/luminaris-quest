import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@/test/utils';
import { Home } from './Home';

// Mock the AuthForm component
vi.mock('@/components/auth/AuthForm', () => ({
  AuthForm: () => <div data-testid="auth-form">Auth Form Component</div>,
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe('Home Page', () => {
  describe('Hero Section', () => {
    it('renders the main title', () => {
      render(<Home />);

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent("Luminari's Quest");
    });

    it('renders the tagline', () => {
      render(<Home />);

      expect(screen.getByText('A Space for Healing')).toBeInTheDocument();
    });

    it('renders the subtitle with therapeutic messaging', () => {
      render(<Home />);

      expect(
        screen.getByText(/You've carried so much\. This is a place to set it down/),
      ).toBeInTheDocument();
    });

    it('renders the CTA button', () => {
      render(<Home />);

      const ctaButton = screen.getByRole('link', { name: /Begin Your Journey/i });
      expect(ctaButton).toBeInTheDocument();
      expect(ctaButton).toHaveAttribute('href', '#begin');
    });

    it('scrolls to auth section when CTA is clicked', () => {
      const scrollIntoViewMock = vi.fn();
      const mockElement = { scrollIntoView: scrollIntoViewMock };
      const getElementByIdSpy = vi
        .spyOn(document, 'getElementById')
        .mockReturnValue(mockElement as unknown as HTMLElement);

      render(<Home />);

      const ctaButton = screen.getByRole('link', { name: /Begin Your Journey/i });
      fireEvent.click(ctaButton);

      expect(document.getElementById).toHaveBeenCalledWith('begin');
      expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth' });

      getElementByIdSpy.mockRestore();
    });
  });

  describe('Features Section', () => {
    it('renders the section title', () => {
      render(<Home />);

      expect(screen.getByRole('heading', { name: /What This Space Offers/i })).toBeInTheDocument();
    });

    it('renders Guardian feature card', () => {
      render(<Home />);

      expect(screen.getByRole('heading', { name: /Your Guardian/i })).toBeInTheDocument();
      expect(screen.getByText(/A gentle presence that grows with you/)).toBeInTheDocument();
    });

    it('renders Light & Shadow feature card', () => {
      render(<Home />);

      expect(screen.getByRole('heading', { name: /Light & Shadow/i })).toBeInTheDocument();
      expect(
        screen.getByText(/Face challenges through gameplay that mirrors real emotional work/),
      ).toBeInTheDocument();
    });

    it('renders Journal feature card', () => {
      render(<Home />);

      expect(screen.getByRole('heading', { name: /Your Journal/i })).toBeInTheDocument();
      expect(screen.getByText(/A private place to capture what surfaces/)).toBeInTheDocument();
    });
  });

  describe('Quote Section', () => {
    it('renders the guardian quote', () => {
      render(<Home />);

      expect(
        screen.getByText(/Between who you were and who you're becoming, there's a bridge/),
      ).toBeInTheDocument();
    });

    it('renders the attribution', () => {
      render(<Home />);

      expect(screen.getByText('The Guardian')).toBeInTheDocument();
    });
  });

  describe('Auth Section', () => {
    it('renders the section with id for scroll targeting', () => {
      render(<Home />);

      const authSection = document.getElementById('begin');
      expect(authSection).toBeInTheDocument();
    });

    it('renders the section title', () => {
      render(<Home />);

      expect(screen.getByRole('heading', { name: /Ready to Begin\?/i })).toBeInTheDocument();
    });

    it('renders privacy messaging', () => {
      render(<Home />);

      expect(
        screen.getByText(/Everything here is private, and you can take as much time as you need/),
      ).toBeInTheDocument();
    });

    it('renders the AuthForm component', () => {
      render(<Home />);

      expect(screen.getByTestId('auth-form')).toBeInTheDocument();
    });
  });

  describe('Footer', () => {
    it('renders the application name', () => {
      render(<Home />);

      // Footer has the app name
      const footerText = screen.getByText("Luminari's Quest", { selector: 'p' });
      expect(footerText).toBeInTheDocument();
    });

    it('renders the tagline', () => {
      render(<Home />);

      expect(screen.getByText(/A sanctuary for healing through play/)).toBeInTheDocument();
    });
  });

  describe('Visual Elements', () => {
    it('renders ember particles with aria-hidden', () => {
      render(<Home />);

      // Starfield container should be aria-hidden for accessibility
      const starfield = document.querySelector('.starfield');
      expect(starfield).toHaveAttribute('aria-hidden', 'true');
    });

    it('renders dust particles with aria-hidden', () => {
      render(<Home />);

      const cosmicDust = document.querySelector('.cosmic-dust');
      expect(cosmicDust).toHaveAttribute('aria-hidden', 'true');
    });

    it('renders decorative sigils with aria-hidden', () => {
      render(<Home />);

      const sigils = document.querySelectorAll('.sigil');
      expect(sigils.length).toBeGreaterThan(0);
      sigils.forEach((sigil) => {
        expect(sigil).toHaveAttribute('aria-hidden', 'true');
      });
    });

    it('renders ambient orbs with aria-hidden', () => {
      render(<Home />);

      const orbs = document.querySelectorAll('.orb');
      expect(orbs.length).toBeGreaterThan(0);
      orbs.forEach((orb) => {
        expect(orb).toHaveAttribute('aria-hidden', 'true');
      });
    });
  });

  describe('Animation System', () => {
    it('generates correct number of ember particles', () => {
      render(<Home />);

      const starfield = document.querySelector('.starfield');
      const embers = starfield?.querySelectorAll('.star');
      expect(embers?.length).toBe(60);
    });

    it('generates correct number of dust particles', () => {
      render(<Home />);

      const cosmicDust = document.querySelector('.cosmic-dust');
      const dustParticles = cosmicDust?.querySelectorAll('.dust-particle');
      expect(dustParticles?.length).toBe(20);
    });

    it('generates correct number of floating motes in auth section', () => {
      render(<Home />);

      const motes = document.querySelectorAll('.mote');
      expect(motes.length).toBe(8);
    });
  });
});
