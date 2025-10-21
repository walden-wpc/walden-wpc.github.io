export default function Footer() {
  return (
    <footer className="py-8 border-t border-surface mt-12">
      <div className="container text-center text-secondary-text text-sm">
        <p>&copy; {new Date().getFullYear()} Walden WPC. All Rights Reserved.</p>
      </div>
    </footer>
  );
}
