import { useAuth } from '../../context/AuthContext';
import { useNotes } from '../../context/NotesContext';
import { useNavigate } from 'react-router-dom';
import { RiRobot2Fill } from 'react-icons/ri';
import { FiLogOut, FiZap } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Header() {
  const { user, logout } = useAuth();
  const { aiUsage } = useNotes();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/login');
  };

  const usagePct = aiUsage.limit > 0 ? (aiUsage.used / aiUsage.limit) * 100 : 0;

  return (
    <header className="header">
      <div className="header-logo">
        <RiRobot2Fill size={26} />
        <span>AI Smart Notes</span>
      </div>

      <div className="header-right">
        {/* AI Usage Pill */}
        <div className="usage-pill" title={`${aiUsage.used}/${aiUsage.limit} AI requests today`}>
          <FiZap size={13} />
          <div className="usage-bar-wrap">
            <div className="usage-bar" style={{ width: `${usagePct}%` }} />
          </div>
          <span>{aiUsage.used}/{aiUsage.limit}</span>
        </div>

        {/* User avatar */}
        <div className="avatar">
          {user?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
        </div>

        <button className="icon-btn" onClick={handleLogout} title="Logout">
          <FiLogOut />
        </button>
      </div>
    </header>
  );
}
