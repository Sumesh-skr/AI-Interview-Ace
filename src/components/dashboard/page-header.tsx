interface PageHeaderProps {
    title: string;
    description: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
    return (
        <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold font-headline">{title}</h1>
            <p className="text-muted-foreground mt-1">{description}</p>
        </div>
    );
}
