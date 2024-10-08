import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  ListIcon,
  PackageIcon,
  StoreIcon
} from "lucide-react";
import { Link, useLocation } from 'react-router-dom';

const MenuLateral = () => {

  const { pathname } = useLocation();

  return (
    <aside className="sticky h-screen inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <TooltipProvider>
          <Link
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
            to="/"
          >
            <StoreIcon className="h-5 w-5 transition-all group-hover:scale-110" />
            <span className="sr-only">Mint Software</span>
          </Link>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                className={pathname === '/produtos' ? 'flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground transition-colors hover:text-foreground md:h-8 md:w-8' : 'flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8'}
                to="/produtos"
              >
                <PackageIcon className="h-5 w-5" />
                <span className="sr-only">Produtos</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Produtos</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                className={pathname === '/pedidos' ? 'flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground transition-colors hover:text-foreground md:h-8 md:w-8' : 'flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8'}
                to="/pedidos"
              >
                <ListIcon className="h-5 w-5" />
                <span className="sr-only">Pedidos</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Pedidos</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </nav>
    </aside>
  )
}

export default MenuLateral;