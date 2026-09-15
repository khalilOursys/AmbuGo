"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import { HorizontaLDots } from "../icons/index";
import {
  ChevronDownIcon,
  UsersIcon,
  UserCog,
  Building2,
  Wrench,
  MapPin,
  ClipboardList,
  HeartPulse,
  UserCircle,
  Briefcase,
  Truck,
  // Sub-item icons
  List,
  PlusCircle,
  Settings,
  BarChart3,
  FileText,
  UserPlus,
  ShieldCheck,
  Activity,
  Cog,
  MapPinned,
  Calendar,
  Route,
  Ambulance,
  Stethoscope,
  Package,
  Boxes,
  Building,
  UserCheck,
} from "lucide-react";
import { getUser, AuthUser } from "@/lib/api/auth";

type SubItem = {
  name: string;
  path: string;
  icon?: React.ReactNode;
  pro?: boolean;
  new?: boolean;
};

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: SubItem[];
};

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [mounted, setMounted] = useState(false);

  // Read user from localStorage after mount
  useEffect(() => {
    setMounted(true);
    setUser(getUser());

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "user" || e.key === "access_token") {
        setUser(getUser());
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Dynamic nav items based on current user's company
  const navItems: NavItem[] = useMemo(() => {
    const cid = user?.companyId;

    if (!mounted || !cid) {
      return [
        {
          name: "Companies",
          icon: <Building2 />,
          subItems: [
            {
              name: "All Companies",
              path: "/companies",
              icon: <List className="w-4 h-4" />,
            },
            {
              name: "Add Company",
              path: "/companies/add",
              icon: <PlusCircle className="w-4 h-4" />,
              new: true,
            },
          ],
        },
        {
          name: "Users",
          icon: <UsersIcon />,
          subItems: [
            {
              name: "All Users",
              path: "/users",
              icon: <List className="w-4 h-4" />,
            },
            {
              name: "Add User",
              path: "/users/add",
              icon: <UserPlus className="w-4 h-4" />,
            },
          ],
        },
        { name: "Profile", icon: <UserCircle />, path: "/profile" },
      ];
    }

    return [
      {
        name: "Companies",
        icon: <Building2 />,
        subItems: [
          {
            name: "Overview",
            path: `/companies/${cid}`,
            icon: <Building className="w-4 h-4" />,
          },
          {
            name: "Settings",
            path: `/companies/${cid}/settings`,
            icon: <Settings className="w-4 h-4" />,
          },
        ],
      },
      {
        name: "Equipment",
        icon: <Wrench />,
        subItems: [
          {
            name: "All Equipment",
            path: `/equipment/${cid}`,
            icon: <Boxes className="w-4 h-4" />,
          },
          {
            name: "Add Equipment",
            path: `/equipment/${cid}/add`,
            icon: <PlusCircle className="w-4 h-4" />,
            new: true,
          },
          {
            name: "Categories",
            path: `/equipment/${cid}/categories`,
            icon: <Package className="w-4 h-4" />,
          },
        ],
      },
      {
        name: "Locations",
        icon: <MapPin />,
        subItems: [
          {
            name: "All Locations",
            path: `/locations/${cid}`,
            icon: <List className="w-4 h-4" />,
          },
          {
            name: "Add Location",
            path: `/locations/${cid}/add`,
            icon: <PlusCircle className="w-4 h-4" />,
          },
          {
            name: "Map View",
            path: `/locations/${cid}/map`,
            icon: <MapPinned className="w-4 h-4" />,
          },
        ],
      },
      {
        name: "Missions",
        icon: <ClipboardList />,
        subItems: [
          {
            name: "All Missions",
            path: `/missions/${cid}`,
            icon: <List className="w-4 h-4" />,
          },
          {
            name: "New Mission",
            path: `/missions/${cid}/add`,
            icon: <PlusCircle className="w-4 h-4" />,
            new: true,
          },
          {
            name: "Schedule",
            path: `/missions/${cid}/schedule`,
            icon: <Calendar className="w-4 h-4" />,
          },
          {
            name: "Routes",
            path: `/missions/${cid}/routes`,
            icon: <Route className="w-4 h-4" />,
          },
          {
            name: "Statistics",
            path: `/missions/${cid}/stats`,
            icon: <BarChart3 className="w-4 h-4" />,
            pro: true,
          },
        ],
      },
      {
        name: "Patients",
        icon: <HeartPulse />,
        subItems: [
          {
            name: "All Patients",
            path: `/patients/${cid}`,
            icon: <List className="w-4 h-4" />,
          },
          {
            name: "Add Patient",
            path: `/patients/${cid}/add`,
            icon: <UserPlus className="w-4 h-4" />,
          },
          {
            name: "Medical Records",
            path: `/patients/${cid}/records`,
            icon: <FileText className="w-4 h-4" />,
          },
        ],
      },
      {
        name: "Services",
        icon: <Briefcase />,
        subItems: [
          {
            name: "All Services",
            path: `/services/${cid}`,
            icon: <List className="w-4 h-4" />,
          },
          {
            name: "Add Service",
            path: `/services/${cid}/add`,
            icon: <PlusCircle className="w-4 h-4" />,
          },
        ],
      },
      {
        name: "Staff",
        icon: <UserCog />,
        subItems: [
          {
            name: "All Staff",
            path: `/staff/${cid}`,
            icon: <List className="w-4 h-4" />,
          },
          {
            name: "Add Staff",
            path: `/staff/${cid}/add`,
            icon: <UserPlus className="w-4 h-4" />,
            new: true,
          },
          {
            name: "Schedules",
            path: `/staff/${cid}/schedules`,
            icon: <Calendar className="w-4 h-4" />,
          },
          {
            name: "Roles",
            path: `/staff/${cid}/roles`,
            icon: <ShieldCheck className="w-4 h-4" />,
          },
        ],
      },
      {
        name: "Vehicles",
        icon: <Truck />,
        subItems: [
          {
            name: "All Vehicles",
            path: `/vehicles/${cid}`,
            icon: <Ambulance className="w-4 h-4" />,
          },
          {
            name: "Add Vehicle",
            path: `/vehicles/${cid}/add`,
            icon: <PlusCircle className="w-4 h-4" />,
          },
          {
            name: "Maintenance",
            path: `/vehicles/${cid}/maintenance`,
            icon: <Wrench className="w-4 h-4" />,
          },
        ],
      },
      {
        name: "Users",
        icon: <UsersIcon />,
        subItems: [
          {
            name: "All Users",
            path: "/users",
            icon: <List className="w-4 h-4" />,
          },
          {
            name: "Add User",
            path: "/users/add",
            icon: <UserPlus className="w-4 h-4" />,
          },
          {
            name: "Permissions",
            path: "/users/permissions",
            icon: <ShieldCheck className="w-4 h-4" />,
          },
        ],
      },
      { name: "Profile", icon: <UserCircle />, path: "/profile" },
    ];
  }, [mounted, user?.companyId]);

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => pathname === path || pathname.startsWith(path + "/"),
    [pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    navItems.forEach((nav, index) => {
      if (nav.subItems) {
        nav.subItems.forEach((subItem) => {
          if (isActive(subItem.path)) {
            setOpenSubmenu({ type: "main", index });
            submenuMatched = true;
          }
        });
      }
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [pathname, isActive, navItems]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu, navItems]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (navItems: NavItem[]) => (
    <ul className="flex flex-col gap-4">
      {navItems.map((nav, index) => {
        const isSubmenuOpen =
          openSubmenu?.type === "main" && openSubmenu?.index === index;
        const hasActiveChild =
          nav.subItems?.some((s) => isActive(s.path)) ?? false;

        return (
          <li key={nav.name}>
            {nav.subItems ? (
              <button
                onClick={() => handleSubmenuToggle(index, "main")}
                className={`menu-item group ${isSubmenuOpen || hasActiveChild
                    ? "menu-item-active"
                    : "menu-item-inactive"
                  } cursor-pointer ${!isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "lg:justify-start"
                  }`}
              >
                <span
                  className={`${isSubmenuOpen || hasActiveChild
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                    }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className={`menu-item-text`}>{nav.name}</span>
                )}
                {(isExpanded || isHovered || isMobileOpen) && (
                  <ChevronDownIcon
                    className={`ml-auto w-5 h-5 transition-transform duration-200 ${isSubmenuOpen ? "rotate-180 text-brand-500" : ""
                      }`}
                  />
                )}
              </button>
            ) : (
              nav.path && (
                <Link
                  href={nav.path}
                  className={`menu-item group ${isActive(nav.path)
                      ? "menu-item-active"
                      : "menu-item-inactive"
                    }`}
                >
                  <span
                    className={`${isActive(nav.path)
                        ? "menu-item-icon-active"
                        : "menu-item-icon-inactive"
                      }`}
                  >
                    {nav.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className={`menu-item-text`}>{nav.name}</span>
                  )}
                </Link>
              )
            )}

            {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
              <div
                ref={(el) => {
                  subMenuRefs.current[`main-${index}`] = el;
                }}
                className="overflow-hidden transition-all duration-300"
                style={{
                  height: isSubmenuOpen
                    ? `${subMenuHeight[`main-${index}`]}px`
                    : "0px",
                }}
              >
                <ul className="mt-2 space-y-1 ml-9">
                  {nav.subItems.map((subItem) => (
                    <li key={subItem.name}>
                      <Link
                        href={subItem.path}
                        className={`menu-dropdown-item flex items-center gap-2 ${isActive(subItem.path)
                            ? "menu-dropdown-item-active"
                            : "menu-dropdown-item-inactive"
                          }`}
                      >
                        {/* Sub-item icon */}
                        {subItem.icon && (
                          <span
                            className={`shrink-0 ${isActive(subItem.path)
                                ? "text-brand-500"
                                : "text-gray-400 dark:text-gray-500"
                              }`}
                          >
                            {subItem.icon}
                          </span>
                        )}

                        <span>{subItem.name}</span>

                        <span className="flex items-center gap-1 ml-auto">
                          {subItem.new && (
                            <span
                              className={`${isActive(subItem.path)
                                  ? "menu-dropdown-badge-active"
                                  : "menu-dropdown-badge-inactive"
                                } menu-dropdown-badge`}
                            >
                              new
                            </span>
                          )}
                          {subItem.pro && (
                            <span
                              className={`${isActive(subItem.path)
                                  ? "menu-dropdown-badge-active"
                                  : "menu-dropdown-badge-inactive"
                                } menu-dropdown-badge`}
                            >
                              pro
                            </span>
                          )}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen
          ? "w-[290px]"
          : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
          }`}
      >
        <Link href="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <Image
                className="dark:hidden"
                src="/images/logo/logo.svg"
                alt="Logo"
                width={150}
                height={40}
              />
              <Image
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <Image
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(navItems)}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;