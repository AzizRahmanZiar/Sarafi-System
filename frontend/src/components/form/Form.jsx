export default function Form({
    children,
    onSubmit,
    className = "",
    ...props
}) {
    return (
        <form onSubmit={onSubmit} className={className} {...props}>
            {children}
        </form>
    );
}