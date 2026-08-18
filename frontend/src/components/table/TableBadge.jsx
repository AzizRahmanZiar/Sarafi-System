import { useTranslation } from 'react-i18next';

export default function TableBadge({ role }) {
    const { t } = useTranslation();

    const getBadgeColor = (role) => {
        switch (role) {
            case 'admin': return 'bg-purple-100 text-purple-800';
            case 'staff': return 'bg-blue-100 text-blue-800';
            case 'customer': return 'bg-green-100 text-green-800';
            case 'saraf': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getRoleDisplay = (role) => {
        switch (role) {
            case 'admin': return t('common.admin');
            case 'staff': return t('common.staff');
            case 'customer': return t('common.customer');
            case 'saraf': return t('common.saraf');
            default: return role;
        }
    };

    return (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getBadgeColor(role)}`}>
            {getRoleDisplay(role)}
        </span>
    );
}