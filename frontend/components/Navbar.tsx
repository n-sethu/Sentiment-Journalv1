import type { FC } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, BarChart3, Plus, LogOut } from 'lucide-react';
import { supabase } from '../src/lib/supabaseClient';
import Button from './button';
import { styles } from './navbar/styles';

interface NavbarProps {
  onLogout?: () => void;
}

const Navbar: FC<NavbarProps> = ({ onLogout }) => {
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      onLogout?.();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <BookOpen className={styles.brandIcon} />
          <span className={styles.brandText}>Sentiment Journal</span>
        </div>
        
        <div className={styles.navLinks}>
          <Link
            to="/dashboard"
            className={`${styles.navLink} ${isActive('/dashboard') ? styles.active : ''}`}
          >
            <BookOpen className={styles.navIcon} />
            Dashboard
          </Link>
          
          <Link
            to="/new-journal"
            className={`${styles.navLink} ${isActive('/new-journal') ? styles.active : ''}`}
          >
            <Plus className={styles.navIcon} />
            New Entry
          </Link>
          
          <Link
            to="/stats"
            className={`${styles.navLink} ${isActive('/stats') ? styles.active : ''}`}
          >
            <BarChart3 className={styles.navIcon} />
            Statistics
          </Link>
        </div>
        
        <div className={styles.userSection}>
          <Button
            variant="ghost"
            size="small"
            onClick={handleLogout}
            className={styles.logoutButton}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
