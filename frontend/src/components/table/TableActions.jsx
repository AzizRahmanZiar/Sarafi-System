// src/components/table/TableActions.jsx
import Button from "../form/Button";

export default function TableActions({
    onEdit,
    onDelete,
    onView,
    showEdit = true,
    showDelete = true,
    showView = false,
}) {
    return (
        <div className="flex items-center gap-2">
            {showView && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onView}
                >
                    View
                </Button>
            )}
            {showEdit && (
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={onEdit}
                >
                    Edit
                </Button>
            )}
            {showDelete && (
                <Button
                    variant="danger"
                    size="sm"
                    onClick={onDelete}
                >
                    Delete
                </Button>
            )}
        </div>
    );
}