import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Layers, 
  Heart, 
  Activity, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Copy, 
  Check, 
  FileText, 
  Maximize2, 
  Menu, 
  X, 
  Share2, 
  HelpCircle,
  Clock, 
  CheckCircle,
  UserPlus, 
  LayoutDashboard, 
  ArrowRight,
  Database,
  Cloud,
  Image as ImageIcon,
  Printer
} from 'lucide-react';

interface Member {
  namaLengkap: string;
  pasangan: string;
  orangTua: string;
  anak: string;
  tanggalLahir: string;
  tanggalMeninggal: string;
  foto: string;
}

// Default avatar fallback
const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop";

const getAvatarUrl = (foto: string | undefined, name: string): string => {
  if (foto && foto.trim() !== '' && !foto.startsWith('http://images.unsplash.com') && !foto.startsWith('https://images.unsplash.com')) {
    return foto;
  }
  // Generate a premium stable cartoon character via Dicebear Avataaars API
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || 'family')}`;
};

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tree' | 'data'>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Database State
  const [familyData, setFamilyData] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [relationFilter, setRelationFilter] = useState("all");
  const [lineageFilter, setLineageFilter] = useState("all");
  const [selectedRootName, setSelectedRootName] = useState("");
  const [treeViewMode, setTreeViewMode] = useState<'focused' | 'full'>('full');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());
  
  // Touch gestures for pinch-to-zoom on mobile devices
  const touchStartDist = useRef<number | null>(null);
  const touchStartZoom = useRef<number>(100);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartDist.current = dist;
      touchStartZoom.current = zoomLevel;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2 && touchStartDist.current !== null) {
      if (e.cancelable) {
        e.preventDefault();
      }
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = dist / touchStartDist.current;
      const targetZoom = Math.round(touchStartZoom.current * ratio);
      const boundedZoom = Math.min(140, Math.max(41, targetZoom));
      setZoomLevel(boundedZoom);
    }
  };

  const handleTouchEndOrCancel = () => {
    touchStartDist.current = null;
  };

  // Loading & State
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Modal Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [oldName, setOldName] = useState("");
  const [formName, setFormName] = useState("");
  const [formSpouse, setFormSpouse] = useState("");
  const [formParents, setFormParents] = useState("");
  const [formChildren, setFormChildren] = useState("");
  const [formBirthdate, setFormBirthdate] = useState("");
  const [formDeceased, setFormDeceased] = useState(false);
  const [formDeceasedDate, setFormDeceasedDate] = useState("");
  const [formFotoBase64, setFormFotoBase64] = useState("");

  // Copy States
  const [copiedCodeGs, setCopiedCodeGs] = useState(false);
  const [copiedIndexHtml, setCopiedIndexHtml] = useState(false);

  // Autofocus Ref
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Prepopulate initial data on mount (from localstorage or default simulation list)
  useEffect(() => {
    setLoading(true);
    const stored = localStorage.getItem('local_family_tree');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setFamilyData(parsed);
        if (parsed.length > 0) {
          setSelectedRootName(parsed[0].namaLengkap);
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      const initial = [
        {
          namaLengkap: "H. Ahmad Dahlan",
          pasangan: "Hj. Siti Aminah",
          orangTua: "",
          anak: "Budi Santoso, Rahayu Hasanah",
          tanggalLahir: "1948-03-12",
          tanggalMeninggal: "",
          foto: ""
        },
        {
          namaLengkap: "Hj. Siti Aminah",
          pasangan: "H. Ahmad Dahlan",
          orangTua: "",
          anak: "Budi Santoso, Rahayu Hasanah",
          tanggalLahir: "1953-07-22",
          tanggalMeninggal: "",
          foto: ""
        },
        {
          namaLengkap: "Budi Santoso",
          pasangan: "Siti Rahma",
          orangTua: "H. Ahmad Dahlan",
          anak: "Roni Santoso, Amalia Santoso",
          tanggalLahir: "1975-11-05",
          tanggalMeninggal: "",
          foto: ""
        },
        {
          namaLengkap: "Siti Rahma",
          pasangan: "Budi Santoso",
          orangTua: "",
          anak: "Roni Santoso, Amalia Santoso",
          tanggalLahir: "1980-08-14",
          tanggalMeninggal: "",
          foto: ""
        },
        {
          namaLengkap: "Roni Santoso",
          pasangan: "",
          orangTua: "Budi Santoso",
          anak: "",
          tanggalLahir: "2002-04-10",
          tanggalMeninggal: "",
          foto: ""
        },
        {
          namaLengkap: "Amalia Santoso",
          pasangan: "",
          orangTua: "Budi Santoso",
          anak: "",
          tanggalLahir: "2006-03-25",
          tanggalMeninggal: "",
          foto: ""
        },
        {
          namaLengkap: "Rahayu Hasanah",
          pasangan: "Ir. Handoko",
          orangTua: "H. Ahmad Dahlan",
          anak: "Doni Handoko",
          tanggalLahir: "1979-05-18",
          tanggalMeninggal: "",
          foto: ""
        },
        {
          namaLengkap: "Ir. Handoko",
          pasangan: "Rahayu Hasanah",
          orangTua: "",
          anak: "Doni Handoko",
          tanggalLahir: "1975-01-30",
          tanggalMeninggal: "2024-02-15",
          foto: ""
        },
        {
          namaLengkap: "Doni Handoko",
          pasangan: "",
          orangTua: "Rahayu Hasanah",
          anak: "",
          tanggalLahir: "2008-09-02",
          tanggalMeninggal: "",
          foto: ""
        }
      ];
      setFamilyData(initial);
      setSelectedRootName("H. Ahmad Dahlan");
      localStorage.setItem('local_family_tree', JSON.stringify(initial));
    }
    setLoading(false);
  }, []);

  // Autofocus name field when modal opens
  useEffect(() => {
    if (isModalOpen) {
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 50);
    }
  }, [isModalOpen]);

  // Statistics calculation helpers
  const totalMembers = familyData.length;
  const aliveMembers = familyData.filter(d => !d.tanggalMeninggal || d.tanggalMeninggal.trim() === "").length;
  const deceasedMembers = totalMembers - aliveMembers;

  const calculateGenerationsEstimate = () => {
    if (familyData.length === 0) return 0;
    const roots = familyData.filter(d => !d.orangTua || d.orangTua.trim() === "");
    if (roots.length === 0) return 1;

    let maxDepth = 1;
    const getChildrenOf = (pName: string) => {
      if(!pName) return [];
      return familyData.filter(d => d.orangTua && d.orangTua.trim().toLowerCase() === pName.trim().toLowerCase());
    };

    roots.forEach(r => {
      let queue = [{ name: r.namaLengkap, depth: 1 }];
      while(queue.length > 0) {
        let curr = queue.shift();
        if (curr) {
          if (curr.depth > maxDepth) maxDepth = curr.depth;
          const kids = getChildrenOf(curr.name);
          kids.forEach(k => {
            queue.push({ name: k.namaLengkap, depth: curr.depth + 1 });
          });
        }
      }
    });

    return maxDepth;
  };

  const estimatedGenerations = calculateGenerationsEstimate();

  // Handle Photo input file reader conversions
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 1048576) {
        alert("Berkas terlalu besar! Batas maksimal kapasitas foto adalah 1MB.");
        e.target.value = "";
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === "string") {
          setFormFotoBase64(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Open clean Add Modal
  const openNewMemberModal = () => {
    setIsUpdate(false);
    setFormName("");
    setFormSpouse("");
    setFormParents("");
    setFormChildren("");
    setFormBirthdate("");
    setFormDeceased(false);
    setFormDeceasedDate("");
    setFormFotoBase64("");
    setIsModalOpen(true);
  };

  // Pre-fill relations helper logic (e.g. Tambah Anak or Tambah Pasangan)
  const quickAddRelation = (relativeName: string, type: 'partner' | 'child') => {
    setIsUpdate(false);
    setFormName("");
    setFormBirthdate("");
    setFormDeceased(false);
    setFormDeceasedDate("");
    setFormFotoBase64("");

    if (type === 'partner') {
      setFormSpouse(relativeName);
      setFormParents("");
      setFormChildren("");
    } else if (type === 'child') {
      setFormParents(relativeName);
      setFormSpouse("");
      setFormChildren("");
    }
    setIsModalOpen(true);
  };

  const openAddRelationModalWithPrepopulate = (name: string) => {
    setIsUpdate(false);
    setFormName(name);
    setFormSpouse("");
    setFormParents("");
    setFormChildren("");
    setFormBirthdate("");
    setFormDeceased(false);
    setFormDeceasedDate("");
    setFormFotoBase64("");
    setIsModalOpen(true);
  };

  // Edit current member
  const startEditMember = (member: Member) => {
    setIsUpdate(true);
    setOldName(member.namaLengkap);
    setFormName(member.namaLengkap);
    setFormSpouse(member.pasangan || "");
    setFormParents(member.orangTua || "");
    setFormChildren(member.anak || "");
    setFormBirthdate(member.tanggalLahir);
    
    if (member.tanggalMeninggal && member.tanggalMeninggal.trim() !== "") {
      setFormDeceased(true);
      setFormDeceasedDate(member.tanggalMeninggal);
    } else {
      setFormDeceased(false);
      setFormDeceasedDate("");
    }
    setFormFotoBase64(member.foto || "");
    setIsModalOpen(true);
  };

  // Delete family member with confirmation
  const deleteMember = (name: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus "${name}" dari catatan silsilah?`)) {
      setLoading(true);
      setTimeout(() => {
        const deletedNameLower = name.trim().toLowerCase();
        let updated = familyData.filter(d => d.namaLengkap.trim().toLowerCase() !== deletedNameLower);
        
        // Referential Integrity Sync: Clean up broken references in remaining family records
        updated = updated.map(item => {
          const cleaned = { ...item };
          if (item.pasangan.trim().toLowerCase() === deletedNameLower) {
            cleaned.pasangan = "";
          }
          if (item.orangTua.trim().toLowerCase() === deletedNameLower) {
            cleaned.orangTua = "";
          }
          if (item.anak.trim().toLowerCase() === deletedNameLower) {
            cleaned.anak = "";
          }
          return cleaned;
        });

        setFamilyData(updated);
        localStorage.setItem('local_family_tree', JSON.stringify(updated));
        
        // If deleted node was root, select next available
        if (selectedRootName.trim().toLowerCase() === deletedNameLower) {
          setSelectedRootName(updated.length > 0 ? updated[0].namaLengkap : "");
        }
        
        setLoading(false);
        triggerToast("Data berhasil dihapus dari simulasi lokal!");
      }, 500);
    }
  };

  // Handle Form Submission with simulated loading indicator and Anti-Double-Click timeout locks
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formBirthdate) {
      alert("Nama Lengkap dan Tanggal Lahir wajib diisi!");
      return;
    }

    const nameTrim = formName.trim();
    const nameLower = nameTrim.toLowerCase();
    const spouseTrim = formSpouse.trim();
    const spouseLower = spouseTrim.toLowerCase();
    const parentsTrim = formParents.trim();
    const parentsLower = parentsTrim.toLowerCase();
    const childrenTrim = formChildren.trim();
    const childrenLower = childrenLowerVal => childrenLowerVal ? childrenLowerVal.toLowerCase() : "";

    // Prevents self-referential relations
    if (spouseLower === nameLower) {
      alert(`Error: Nama pasangan tidak boleh sama dengan nama diri sendiri ("${nameTrim}")!`);
      return;
    }
    if (parentsLower === nameLower) {
      alert(`Error: Nama orang tua tidak boleh sama dengan nama diri sendiri ("${nameTrim}")!`);
      return;
    }
    if (childrenTrim.toLowerCase() === nameLower) {
      alert(`Error: Nama anak tidak boleh sama dengan nama diri sendiri ("${nameTrim}")!`);
      return;
    }

    // Prevents logically conflicting roles
    if (spouseTrim && parentsTrim && spouseLower === parentsLower) {
      alert(`Error: Orang tua ("${parentsTrim}") tidak boleh sama dengan pasangan ("${spouseTrim}")!`);
      return;
    }
    if (spouseTrim && childrenTrim && spouseLower === childrenTrim.toLowerCase()) {
      alert(`Error: Anak ("${childrenTrim}") tidak boleh sama dengan pasangan ("${spouseTrim}")!`);
      return;
    }
    if (parentsTrim && childrenTrim && parentsLower === childrenTrim.toLowerCase()) {
      alert(`Error: Orang tua ("${parentsTrim}") tidak boleh sama dengan anak ("${childrenTrim}")!`);
      return;
    }

    // Chronological date safety checks
    const birthDateObj = new Date(formBirthdate);
    const today = new Date();

    if (birthDateObj > today) {
      alert("Error: Tanggal Lahir tidak boleh di masa depan!");
      return;
    }

    if (formDeceased) {
      if (!formDeceasedDate) {
        alert("Error: Tanggal Wafat wajib ditentukan jika status Anggota adalah Wafat.");
        return;
      }
      const deceasedDateObj = new Date(formDeceasedDate);
      if (deceasedDateObj > today) {
        alert("Error: Tanggal Wafat tidak boleh di masa depan!");
        return;
      }
      if (deceasedDateObj < birthDateObj) {
        alert("Error: Tanggal Wafat tidak boleh mendahului Tanggal Lahir!");
        return;
      }
    }

    setLoading(true);

    const newMember: Member = {
      namaLengkap: nameTrim,
      pasangan: spouseTrim,
      orangTua: parentsTrim,
      anak: childrenTrim,
      tanggalLahir: formBirthdate,
      tanggalMeninggal: formDeceased ? formDeceasedDate : "",
      foto: formFotoBase64
    };

    setTimeout(() => {
      let updatedData = [...familyData];
      
      if (isUpdate) {
        const index = updatedData.findIndex(d => d.namaLengkap.trim().toLowerCase() === oldName.trim().toLowerCase());
        if (index > -1) {
          const isNameChanged = nameLower !== oldName.trim().toLowerCase();
          if (isNameChanged) {
            const isExist = updatedData.some(d => d.namaLengkap.trim().toLowerCase() === nameLower);
            if (isExist) {
              alert(`Nama "${nameTrim}" sudah digunakan oleh orang lain di database!`);
              setLoading(false);
              return;
            }

            // Referential Integrity Sync: Update references to oldName in other family records
            const oldNameLower = oldName.trim().toLowerCase();
            updatedData = updatedData.map(item => {
              const updatedItem = { ...item };
              if (item.pasangan.trim().toLowerCase() === oldNameLower) {
                updatedItem.pasangan = nameTrim;
              }
              if (item.orangTua.trim().toLowerCase() === oldNameLower) {
                updatedItem.orangTua = nameTrim;
              }
              if (item.anak.trim().toLowerCase() === oldNameLower) {
                updatedItem.anak = nameTrim;
              }
              return updatedItem;
            });
          }
          updatedData[index] = newMember;
        }
      } else {
        const isExist = updatedData.some(d => d.namaLengkap.trim().toLowerCase() === nameLower);
        if (isExist) {
          alert(`Anggota bernama "${nameTrim}" sudah terdaftar dalam database!`);
          setLoading(false);
          return;
        }
        updatedData.push(newMember);
      }

      setFamilyData(updatedData);
      localStorage.setItem('local_family_tree', JSON.stringify(updatedData));
      
      // Auto select root if empty
      if (!selectedRootName || (isUpdate && selectedRootName.trim().toLowerCase() === oldName.trim().toLowerCase())) {
        setSelectedRootName(newMember.namaLengkap);
      }

      setIsModalOpen(false);
      setLoading(false);
      triggerToast(isUpdate ? "Data berhasil dikoreksi!" : "Anggota keluarga berhasil ditambahkan!");
    }, 800);
  };

  // Clipboard copy utilities
  const copyToClipboard = (text: string, type: 'code' | 'html') => {
    navigator.clipboard.writeText(text);
    if (type === 'code') {
      setCopiedCodeGs(true);
      setTimeout(() => setCopiedCodeGs(false), 2000);
    } else {
      setCopiedIndexHtml(true);
      setTimeout(() => setCopiedIndexHtml(false), 2000);
    }
  };

  const triggerToast = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  // Anti-XSS and Filter algorithms
  const getFilteredData = () => {
    return familyData.filter(item => {
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = 
        item.namaLengkap.toLowerCase().includes(q) ||
        (item.pasangan && item.pasangan.toLowerCase().includes(q)) ||
        (item.orangTua && item.orangTua.toLowerCase().includes(q)) ||
        (item.anak && item.anak.toLowerCase().includes(q));

      let matchStatus = true;
      const isDeceased = item.tanggalMeninggal && item.tanggalMeninggal.trim() !== "";
      if (statusFilter === 'alive') {
        matchStatus = !isDeceased;
      } else if (statusFilter === 'deceased') {
        matchStatus = isDeceased;
      }

      let matchRelation = true;
      if (relationFilter === 'has_partner') {
        matchRelation = !!(item.pasangan && item.pasangan.trim() !== "");
      } else if (relationFilter === 'has_children') {
        matchRelation = !!(item.anak && item.anak.trim() !== "");
      }

      let matchLineage = true;
      if (lineageFilter === 'descendants') {
        const isSpouse = 
          (!item.orangTua || item.orangTua.trim() === "") && 
          !!(item.pasangan && item.pasangan.trim() !== "") &&
          !familyData.some(other => other.orangTua && other.orangTua.toLowerCase().trim() === item.namaLengkap.toLowerCase().trim());
        matchLineage = !isSpouse;
      } else if (lineageFilter === 'spouses') {
        const isSpouse = 
          (!item.orangTua || item.orangTua.trim() === "") && 
          !!(item.pasangan && item.pasangan.trim() !== "") &&
          !familyData.some(other => other.orangTua && other.orangTua.toLowerCase().trim() === item.namaLengkap.toLowerCase().trim());
        matchLineage = isSpouse;
      }

      return matchQuery && matchStatus && matchRelation && matchLineage;
    });
  };

  const filteredData = getFilteredData();

  // Calculate tree nodes relative to selected Root Node
  const getTreeHierarchy = () => {
    if (!selectedRootName) return { parents: [], root: null, spouse: null, children: [] };
    const root = familyData.find(d => d.namaLengkap.toLowerCase().trim() === selectedRootName.toLowerCase().trim());
    if (!root) return { parents: [], root: null, spouse: null, children: [] };

    // 1. Find Parents
    const parents: Member[] = [];
    if (root.orangTua && root.orangTua.trim() !== "") {
      const pObj = familyData.find(d => d.namaLengkap.toLowerCase().trim() === root.orangTua.toLowerCase().trim());
      if (pObj) {
        parents.push(pObj);
        if (pObj.pasangan && pObj.pasangan.trim() !== "") {
          const spouseParents = familyData.find(d => d.namaLengkap.toLowerCase().trim() === pObj.pasangan.toLowerCase().trim());
          if (spouseParents && !parents.some(x => x.namaLengkap === spouseParents.namaLengkap)) {
            parents.push(spouseParents);
          }
        }
      } else {
        parents.push({ namaLengkap: root.orangTua, pasangan: "", orangTua: "", anak: "", tanggalLahir: "-", tanggalMeninggal: "", foto: "" });
      }
    }

    // 2. Spouse
    let spouse: Member | null = null;
    if (root.pasangan && root.pasangan.trim() !== "") {
      const sObj = familyData.find(d => d.namaLengkap.toLowerCase().trim() === root.pasangan.toLowerCase().trim());
      spouse = sObj || { namaLengkap: root.pasangan, pasangan: root.namaLengkap, orangTua: "", anak: "", tanggalLahir: "-", tanggalMeninggal: "", foto: "" };
    }

    // 3. Children
    const children: Member[] = [];
    if (root.anak && root.anak.trim() !== "") {
      const kidNames = root.anak.split(',');
      kidNames.forEach(kn => {
        const cleanName = kn.trim();
        const kObj = familyData.find(d => d.namaLengkap.toLowerCase().trim() === cleanName.toLowerCase());
        children.push(kObj || { namaLengkap: cleanName, pasangan: "", orangTua: root.namaLengkap, anak: "", tanggalLahir: "-", tanggalMeninggal: "", foto: "" });
      });
    }

    return { parents, root, spouse, children };
  };

  const treeGraph = getTreeHierarchy();

  interface TreeNode {
    member: Member;
    spouse: Member | null;
    children: TreeNode[];
  }

  const toggleCollapseNode = (name: string) => {
    setCollapsedNodes(prev => {
      const next = new Set<string>();
      prev.forEach(v => next.add(v));
      const normalized = name.toLowerCase().trim();
      if (next.has(normalized)) {
        next.delete(normalized);
      } else {
        next.add(normalized);
      }
      return next;
    });
  };

  const getFullFamilyTree = (): TreeNode[] => {
    if (familyData.length === 0) return [];
    const visited = new Set<string>();

    const hasParentInDb = (m: Member) => {
      if (!m.orangTua || m.orangTua.trim() === "") return false;
      return familyData.some(other => other.namaLengkap.toLowerCase().trim() === m.orangTua.toLowerCase().trim());
    };

    const candidates = familyData.filter(m => {
      const noParent = !hasParentInDb(m);
      if (!noParent) return false;

      const isSpouseOfSomeoneWithParent = familyData.some(other => 
        other.pasangan && 
        other.pasangan.toLowerCase().trim() === m.namaLengkap.toLowerCase().trim() &&
        hasParentInDb(other)
      );
      if (isSpouseOfSomeoneWithParent) return false;

      return true;
    });

    const processedCandidates = new Set<string>();

    const buildNode = (m: Member): TreeNode => {
      const mNameLower = m.namaLengkap.toLowerCase().trim();
      visited.add(mNameLower);
      
      let spouseObj: Member | null = null;
      if (m.pasangan && m.pasangan.trim() !== "") {
        const foundSpouse = familyData.find(other => other.namaLengkap.toLowerCase().trim() === m.pasangan.toLowerCase().trim());
        spouseObj = foundSpouse || {
          namaLengkap: m.pasangan,
          pasangan: m.namaLengkap,
          orangTua: "",
          anak: "",
          tanggalLahir: "-",
          tanggalMeninggal: "",
          foto: ""
        };
      }

      const directChildren = familyData.filter(other => {
        const parentName = other.orangTua ? other.orangTua.toLowerCase().trim() : "";
        if (parentName === "") return false;
        
        const matchPrimary = parentName === m.namaLengkap.toLowerCase().trim();
        const matchSpouse = spouseObj ? parentName === spouseObj.namaLengkap.toLowerCase().trim() : false;
        
        return matchPrimary || matchSpouse;
      });

      const childNames = new Set<string>();
      if (m.anak && m.anak.trim() !== "") {
        m.anak.split(',').forEach(n => childNames.add(n.trim().toLowerCase()));
      }
      if (spouseObj && spouseObj.anak && spouseObj.anak.trim() !== "") {
        spouseObj.anak.split(',').forEach(n => childNames.add(n.trim().toLowerCase()));
      }

      const childNodes: TreeNode[] = [];
      const treatedKidNames = new Set<string>();

      directChildren.forEach(kid => {
        const kidLower = kid.namaLengkap.toLowerCase().trim();
        treatedKidNames.add(kidLower);
        if (!visited.has(kidLower)) {
          childNodes.push(buildNode(kid));
        }
      });

      childNames.forEach(name => {
        const cleanName = name.trim();
        if (!treatedKidNames.has(cleanName) && cleanName !== "") {
          const placeholderKid: Member = {
            namaLengkap: name.charAt(0).toUpperCase() + name.slice(1),
            pasangan: "",
            orangTua: m.namaLengkap,
            anak: "",
            tanggalLahir: "-",
            tanggalMeninggal: "",
            foto: ""
          };
          const lowerPlaceholder = placeholderKid.namaLengkap.toLowerCase().trim();
          if (!visited.has(lowerPlaceholder)) {
            childNodes.push(buildNode(placeholderKid));
          }
        }
      });

      return {
        member: m,
        spouse: spouseObj,
        children: childNodes
      };
    };

    const roots: TreeNode[] = [];
    candidates.forEach(m => {
      const mName = m.namaLengkap.toLowerCase().trim();
      if (processedCandidates.has(mName)) return;

      let isSpouseProcessed = false;
      if (m.pasangan && m.pasangan.trim() !== "") {
        const spName = m.pasangan.toLowerCase().trim();
        if (processedCandidates.has(spName)) {
          isSpouseProcessed = true;
        }
      }

      if (!isSpouseProcessed) {
        processedCandidates.add(mName);
        if (m.pasangan && m.pasangan.trim() !== "") {
          processedCandidates.add(m.pasangan.toLowerCase().trim());
        }
        roots.push(buildNode(m));
      }
    });

    return roots;
  };

  const fullTreeData = getFullFamilyTree();

  const renderFullTreeNode = (node: TreeNode): React.ReactNode => {
    const nodeKey = node.member.namaLengkap.toLowerCase().trim();
    const isCollapsed = collapsedNodes.has(nodeKey);
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div className="flex flex-col items-center relative" key={nodeKey}>
        {/* COUPLING BLOCK (Member + Spouse) */}
        <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm p-2 rounded-2xl border border-slate-200 shadow-sm relative group hover:border-indigo-400 hover:shadow-md transition-all">
          
          {/* Main Member Node */}
          <div 
            onClick={() => {
              setSelectedRootName(node.member.namaLengkap);
              triggerToast(`Ditunjuk sebagai Fokus Silsilah: ${node.member.namaLengkap}`);
            }}
            className={`w-44 p-3 rounded-xl text-center cursor-pointer transition-all ${
              selectedRootName.toLowerCase().trim() === nodeKey 
                ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-300' 
                : 'bg-slate-50 border border-slate-100 hover:bg-indigo-50 text-slate-800'
            }`}
          >
            <div className="relative">
              <img 
                src={getAvatarUrl(node.member.foto, node.member.namaLengkap)} 
                className={`w-10 h-10 rounded-full object-cover mx-auto mb-1.5 border-2 ${
                  selectedRootName.toLowerCase().trim() === nodeKey ? 'border-white' : 'border-indigo-200'
                }`} 
                alt="" 
              />
              {node.member.tanggalMeninggal && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-slate-400 border-2 border-white rounded-full flex items-center justify-center text-[8px] text-white font-bold" title="Wafat">†</span>
              )}
            </div>
            <div className="font-bold text-[11px] truncate font-sans" title={node.member.namaLengkap}>{node.member.namaLengkap}</div>
            <span className={`text-[9px] block font-mono ${selectedRootName.toLowerCase().trim() === nodeKey ? 'text-indigo-200' : 'text-slate-400'}`}>
              Lahir: {node.member.tanggalLahir || '-'}
            </span>
          </div>

          {/* Marriage Connector */}
          {node.spouse && (
            <div className="w-4 h-0.5 bg-slate-300 flex-shrink-0 relative">
              <Heart className="w-3.5 h-3.5 text-rose-500 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 fill-rose-500" />
            </div>
          )}

          {/* Spouse Node */}
          {node.spouse && (
            <div 
              onClick={() => {
                if (familyData.some(x => x.namaLengkap.toLowerCase().trim() === node.spouse!.namaLengkap.toLowerCase().trim())) {
                  setSelectedRootName(node.spouse.namaLengkap);
                  triggerToast(`Ditunjuk sebagai Fokus Silsilah: ${node.spouse.namaLengkap}`);
                } else if (node.spouse) {
                  if (window.confirm(`Registrasi data lengkap pasangan "${node.spouse.namaLengkap}" sekarang?`)) {
                    openAddRelationModalWithPrepopulate(node.spouse.namaLengkap);
                  }
                }
              }}
              className="w-44 p-3 rounded-xl text-center cursor-pointer bg-rose-50 hover:bg-rose-100/70 text-slate-800 border border-rose-100 hover:border-rose-300 transition-all font-medium"
            >
              <div className="relative">
                <img 
                  src={getAvatarUrl(node.spouse.foto, node.spouse.namaLengkap)} 
                  className="w-10 h-10 rounded-full object-cover mx-auto mb-1.5 border-2 border-rose-200" 
                  alt="" 
                />
                {node.spouse.tanggalMeninggal && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-slate-400 border-2 border-white rounded-full flex items-center justify-center text-[8px] text-white font-bold" title="Wafat">†</span>
                )}
              </div>
              <div className="font-bold text-[11px] truncate text-rose-800 font-sans" title={node.spouse.namaLengkap}>{node.spouse.namaLengkap}</div>
              <span className="text-[9px] block font-mono text-rose-400">
                Lahir: {node.spouse.tanggalLahir || '-'}
              </span>
            </div>
          )}

          {/* Action Popovers on hovering nodes */}
          <div className="absolute -top-3.5 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 border border-slate-700 rounded-lg px-1.5 py-0.5 shadow-lg z-10">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                const fullRecord = familyData.find(x => x.namaLengkap.toLowerCase().trim() === nodeKey);
                if (fullRecord) {
                  startEditMember(fullRecord);
                } else {
                  openAddRelationModalWithPrepopulate(node.member.namaLengkap);
                }
              }}
              type="button"
              title="Edit Anggota"
              className="text-slate-300 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Edit className="w-3 h-3" />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                const fullRecord = familyData.find(x => x.namaLengkap.toLowerCase().trim() === nodeKey);
                if (fullRecord) {
                  deleteMember(fullRecord);
                } else {
                  triggerToast('Data tidak terdaftar lengkap.');
                }
              }}
              type="button"
              title="Hapus Anggota"
              className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>

          {/* Children Expand / Collapse Button */}
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleCollapseNode(nodeKey);
              }}
              type="button"
              className="absolute bottom-[-14px] left-1/2 -translate-x-1/2 bg-white border border-slate-300 text-slate-600 hover:text-indigo-600 hover:border-indigo-500 w-6 h-6 rounded-full flex items-center justify-center shadow-md z-20 cursor-pointer transition-all"
            >
              {isCollapsed ? (
                <span className="text-xs font-bold leading-none font-mono">+</span>
              ) : (
                <span className="text-xs font-bold leading-none font-mono">-</span>
              )}
            </button>
          )}

        </div>

        {/* Dynamic Connective Lines */}
        {hasChildren && !isCollapsed && (
          <div className="flex flex-col items-center w-full mt-4">
            {/* Trunk line leaving parent couple box */}
            <div className="w-0.5 h-6 bg-slate-300" />
            
            <div className="flex gap-x-8 gap-y-12 items-start relative">
              {/* Spreading horizontal bar */}
              {node.children.length > 1 && (
                <div 
                  className="absolute bg-slate-300 h-0.5" 
                  style={{
                    left: `${(100 / node.children.length) / 2}%`,
                    right: `${(100 / node.children.length) / 2}%`,
                    top: '0px'
                  }}
                />
              )}

              {node.children.map((childNode, index) => {
                return (
                  <div className="flex flex-col items-center relative" key={childNode.member.namaLengkap}>
                    {/* Dropping line entering each child's block */}
                    <div className="w-0.5 h-5 bg-slate-300" />
                    
                    {/* Recursive tree call */}
                    {renderFullTreeNode(childNode)}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans antialiased">
      
      {/* Global CSS Print Styles Configuration */}
      <style>{`
        @media print {
          /* Setup perfect Landscape A4/Letter size */
          @page {
            size: landscape;
            margin: 10mm 15mm 10mm 15mm;
          }
          
          /* Hide overall workspace chrome including sidebars, headers, action strip, tabs, and top control panels */
          header, aside, footer, nav, button, select, input, .no-print, .fixed, [role="tablist"], .no-print-panel {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          /* Reset root container sizing & style */
          body, #root, main, .min-h-screen, .flex-1, .space-y-6, .p-4, .lg\\:p-8, .p-6, .py-6 {
            background: #ffffff !important;
            background-color: #ffffff !important;
            background-image: none !important;
            color: #000000 !important;
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            min-height: 0 !important;
            height: auto !important;
            width: 100% !important;
            overflow: visible !important;
          }
          
          /* Force page wrap containment container specifically for tree */
          #print-tree-container {
            display: block !important;
            visibility: visible !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: #ffffff !important;
            background-color: #ffffff !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
            min-height: 0 !important;
          }
          
          #print-tree-container * {
            visibility: visible;
          }

          /* Force tree scale reset on print for perfect grid resolution */
          #print-tree-canvas-wrapper {
            transform: scale(1) !important;
            transform-origin: top center !important;
            width: 100% !important;
            zoom: 1 !important;
            overflow: visible !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: flex-start !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
          }

          /* Keep connecting lines crisp on print */
          .bg-slate-300 {
            background-color: #94a3b8 !important;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          .border-slate-300 {
            border-color: #94a3b8 !important;
          }

          /* Node colors adjustments on printing */
          .bg-white\\/95, .bg-white {
            background-color: #ffffff !important;
            border-color: #cbd5e1 !important;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          .bg-slate-50 {
            background-color: #f8fafc !important;
            border-color: #cbd5e1 !important;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          .bg-rose-50 {
            background-color: #fff1f2 !important;
            border-color: #fecdd3 !important;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          .bg-indigo-50 {
            background-color: #e0e7ff !important;
            border-color: #c7d2fe !important;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          /* Ensure images and custom graphics render correctly */
          img {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            border-color: #cbd5e1 !important;
          }
        }
      `}</style>
      
      {/* Toast Alert */}
      {successMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-5 h-5" />
          <span className="font-semibold text-sm">{successMsg}</span>
        </div>
      )}

      {/* MOBILE NAVBAR UPPER */}
      <header className="lg:hidden bg-indigo-950 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)} 
            className="p-2 hover:bg-indigo-900 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold text-lg tracking-tight flex items-center gap-1.5">
            <Layers className="w-5 h-5 text-sky-400" /> Silsilah Digital
          </span>
        </div>
        <div className="bg-amber-500 text-slate-900 font-mono text-xs px-2.5 py-1 rounded-full font-bold">
          Local Sandbox
        </div>
      </header>

      {/* SIDEBAR WRAPPER */}
      <div className="flex-1 flex relative">
        <aside className={`
          fixed lg:sticky top-0 bottom-0 left-0 z-40 w-72 bg-gradient-to-br from-indigo-950 to-slate-950 text-white flex flex-col p-5 shadow-2xl transition-transform duration-300 transform
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-0 lg:translate-x-0'}
          ${!mobileSidebarOpen && 'hidden lg:flex'}
        `}>
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-xl text-white">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-bold text-base tracking-tight text-white leading-none">Silsilah Keluarga</h2>
                <span className="text-slate-400 text-xs font-mono">Panel Administrasi</span>
              </div>
            </div>
            <button 
              onClick={() => setMobileSidebarOpen(false)} 
              className="lg:hidden p-1.5 hover:bg-slate-900 rounded-lg text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 space-y-1.5">
            <button 
              onClick={() => { setActiveTab('dashboard'); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm text-left ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
            >
              <LayoutDashboard className="w-5 h-5" /> Dashboard
            </button>
            <button 
              onClick={() => { setActiveTab('tree'); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm text-left ${activeTab === 'tree' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
            >
              <Layers className="w-5 h-5" /> Pohon Keluarga (Bagan)
            </button>
            <button 
              onClick={() => { setActiveTab('data'); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm text-left ${activeTab === 'data' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
            >
              <Database className="w-5 h-5" /> Kelola Records Data
            </button>
          </nav>

          <div className="mt-auto bg-slate-900/60 p-4 rounded-xl border border-white/5">
            <span className="text-slate-500 font-mono text-[10px] block mb-1">KONEKSI SISTEM:</span>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
              <span className="font-mono text-xs text-emerald-400 font-bold">Simulator Aktif (Ready)</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
              Interaksi aman dengan <strong>Script Lock</strong> &amp; <strong>Formula Sanitizer</strong>.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 text-center text-slate-500 text-xs font-mono">
            Silsilah Keluarga App &copy; 2026
          </div>
        </aside>

        {/* MAIN BODY AREA */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Welcome Card banner */}
              <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-indigo-900 text-white rounded-2xl p-6 lg:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-indigo-600">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight mb-2">
                    Silsilah Keluarga Dashboard
                  </h1>
                  <p className="text-indigo-150 text-sm max-w-2xl leading-relaxed">
                    Database silsilah hibrida modern dengan visualisasi pohon dinamis, pelaporan PDF Landscape, serta integrasi anti-tabrakan data Google Spreadsheet.
                  </p>
                </div>
                <button 
                  onClick={openNewMemberModal}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-5 py-3 rounded-xl transition-all shadow-lg flex items-center gap-2 text-sm w-full md:w-auto justify-center cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-slate-950" /> Tambah Anggota Silsilah
                </button>
              </div>

              {/* Statistics Grid widgets */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 font-mono tracking-wider block mb-1">TOTAL ANGGOTA</span>
                    <h3 className="text-2xl font-extrabold text-slate-950">{totalMembers}</h3>
                  </div>
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Users className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 font-mono tracking-wider block mb-1">LEVEL GENERASI</span>
                    <h3 className="text-2xl font-extrabold text-slate-950">~{estimatedGenerations}</h3>
                  </div>
                  <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
                    <Layers className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 font-mono tracking-wider block mb-1">ANGGOTA HIDUP</span>
                    <h3 className="text-2xl font-extrabold text-slate-950">{aliveMembers}</h3>
                  </div>
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                    <Heart className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 font-mono tracking-wider block mb-1">TELAH WAFAT</span>
                    <h3 className="text-2xl font-extrabold text-slate-950">{deceasedMembers}</h3>
                  </div>
                  <div className="p-3 bg-slate-100 text-slate-600 rounded-xl">
                    <Activity className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Visual mini chart and recent logs */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Simulated Chart.js Bar Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-7">
                  <div className="flex items-center justify-between mb-6">
                    <h5 className="font-bold text-slate-900 tracking-tight flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full" /> Statistik Pengakses Dashboard
                    </h5>
                    <span className="font-mono text-xs text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md">Simulated Activity</span>
                  </div>
                  
                  {/* CSS-based beautiful responsive bar chart */}
                  <div className="h-64 flex items-end justify-between gap-3 pt-6 border-b border-dashed border-slate-200">
                    {[
                      { l: 'Sen', v: 42, h: 'h-[30%]' },
                      { l: 'Sel', v: 65, h: 'h-[46%]' },
                      { l: 'Rab', v: 88, h: 'h-[62%]' },
                      { l: 'Kam', v: 54, h: 'h-[38%]' },
                      { l: 'Jum', v: 73, h: 'h-[51%]' },
                      { l: 'Sab', v: 110, h: 'h-[77%]' },
                      { l: 'Min', v: 137, h: 'h-[100%]' },
                    ].map((item, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                        <div className="relative w-full flex items-end justify-center">
                          <span className="absolute -top-7 opacity-0 group-hover:opacity-100 bg-slate-900 text-white font-mono text-[10px] px-1.5 py-0.5 rounded transition-all shadow-md">
                            {item.v} hit
                          </span>
                          <div className={`w-full max-w-[40px] bg-indigo-600/90 group-hover:bg-indigo-600 transition-all rounded-t-lg ${item.h}`} />
                        </div>
                        <span className="font-mono text-xs text-slate-400 group-hover:text-slate-950 font-medium">{item.l}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent submissions sidebar table */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-500" /> Ringkasan Registrasi Terbaru
                      </h5>
                      <button 
                        onClick={() => setActiveTab('data')}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                      >
                        Lihat Semua
                      </button>
                    </div>

                    <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                      {familyData.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 text-xs">
                          Belum ada rekam data silsilah keluarga.
                        </div>
                      ) : (
                        [...familyData].reverse().slice(0, 3).map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl transition-all border border-slate-100">
                            <div className="flex items-center gap-3">
                              <img 
                                src={getAvatarUrl(item.foto, item.namaLengkap)} 
                                alt="avatar" 
                                className="w-10 h-10 rounded-full object-cover border border-slate-200"
                              />
                              <div>
                                <h6 className="font-bold text-slate-900 text-xs">{item.namaLengkap}</h6>
                                <span className="text-slate-400 font-mono text-[10px] block">Lahir: {item.tanggalLahir}</span>
                              </div>
                            </div>
                            <div>
                              {item.tanggalMeninggal && item.tanggalMeninggal.trim() !== "" ? (
                                <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-semibold">Wafat</span>
                              ) : (
                                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">Hidup</span>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs text-slate-400">
                    <span>Terakhir sinkronisasi:</span>
                    <span className="font-mono text-indigo-600 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Live Simulator
                    </span>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: POHON KELUARGA BAGAN MAPS */}
          {activeTab === 'tree' && (
            <div className="space-y-6">
              
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-lg tracking-tight flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-600" /> Tampilan Bagan Silsilah Interaktif
                  </h4>
                  <p className="text-slate-400 text-xs mt-0.5">Pilih mode tampilan penuh (Bagan Keluarga Besar) atau mode silsilah tiga generasi terfokus.</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                  {/* Mode select button group */}
                  <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => { setTreeViewMode('full'); triggerToast("Beralih ke Bagan Keluarga Besar"); }}
                      className={`text-xs px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer w-1/2 sm:w-auto justify-center ${
                        treeViewMode === 'full' 
                          ? 'bg-indigo-600 text-white shadow-sm' 
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" /> Bagan Keluarga Besar
                    </button>
                    <button
                      type="button"
                      onClick={() => { setTreeViewMode('focused'); triggerToast("Beralih ke Silsilah Terfokus"); }}
                      className={`text-xs px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer w-1/2 sm:w-auto justify-center ${
                        treeViewMode === 'focused' 
                          ? 'bg-indigo-600 text-white shadow-sm' 
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" /> Silsilah Terfokus
                    </button>
                  </div>

                  {treeViewMode === 'focused' && (
                    <div className="flex items-center gap-2.5 w-full sm:w-auto">
                      <span className="text-slate-600 text-xs font-semibold text-nowrap">Akar Tokoh:</span>
                      <select 
                        value={selectedRootName}
                        onChange={(e) => setSelectedRootName(e.target.value)}
                        className="form-select bg-slate-50 border border-slate-200 focus:border-indigo-600 rounded-xl text-slate-900 text-xs px-3 py-2.5 font-medium outline-none w-full sm:w-56"
                      >
                        {familyData.length === 0 ? (
                          <option value="">Database Kosong</option>
                        ) : (
                          <>
                            <optgroup label="Usulan Tetua Silsilah">
                              {familyData.filter(d => !d.orangTua || d.orangTua.trim() === "").map((item, idx) => (
                                <option key={idx} value={item.namaLengkap}>{item.namaLengkap} (Tetua)</option>
                              ))}
                            </optgroup>
                            <optgroup label="Anggota Lain">
                              {familyData.filter(d => d.orangTua && d.orangTua.trim() !== "").map((item, idx) => (
                                <option key={idx} value={item.namaLengkap}>{item.namaLengkap}</option>
                              ))}
                            </optgroup>
                          </>
                        )}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* ZOOM & EXPAND ACTION STRIP */}
              <div className="bg-white px-5 py-3.5 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 font-extrabold font-mono uppercase tracking-wider">Perbesaran: {zoomLevel}%</span>
                  <input 
                    type="range" 
                    min="41" 
                    max="140" 
                    value={zoomLevel} 
                    onChange={(e) => setZoomLevel(Number(e.target.value))}
                    className="w-36 accent-indigo-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg appearance-none" 
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    type="button"
                    onClick={() => setZoomLevel(Math.max(41, zoomLevel - 10))}
                    className="p-1 px-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-700 text-xs font-bold border border-slate-200 cursor-pointer transition-colors"
                    title="Zoom Out"
                  >
                    - Less
                  </button>
                  <button 
                    type="button"
                    onClick={() => setZoomLevel(100)}
                    className="p-1 px-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-700 text-xs font-bold border border-slate-200 cursor-pointer transition-colors"
                    title="Reset Zoom"
                  >
                    Reset (100%)
                  </button>
                  <button 
                    type="button"
                    onClick={() => setZoomLevel(Math.min(140, zoomLevel + 10))}
                    className="p-1 px-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-700 text-xs font-bold border border-slate-200 cursor-pointer transition-colors"
                    title="Zoom In"
                  >
                    + More
                  </button>
                  <span className="border-l border-slate-200 h-5 mx-1" />
                  <button 
                    type="button"
                    onClick={() => { setCollapsedNodes(new Set()); triggerToast("Semua cabang dibuka kembali"); }}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-extrabold cursor-pointer hover:underline"
                    title="Expand semua cabang silsilah"
                  >
                    Buka Semua Cabang
                  </button>
                  <span className="border-l border-slate-200 h-5 mx-1" />
                  <button 
                    type="button"
                    onClick={() => {
                      triggerToast("Mempersiapkan cetak silsilah...");
                      setTimeout(() => {
                        window.print();
                      }, 300);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-sm transition-all cursor-pointer"
                    title="Cetak Bagan Silsilah ke PDF atau kertas"
                  >
                    <Printer className="w-3.5 h-3.5" /> Cetak PDF Bagan
                  </button>
                </div>
              </div>

              {/* TREE CANVAS STRUCTURE */}
              <div 
                id="print-tree-container" 
                className="bg-white rounded-3xl p-6 lg:p-12 shadow-sm border border-slate-150 overflow-auto min-h-[580px] flex flex-col items-center justify-start relative select-none"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEndOrCancel}
                onTouchCancel={handleTouchEndOrCancel}
              >
                
                {/* Touch Device Tip */}
                <div className="md:hidden block w-full text-center mb-5 bg-indigo-50/60 border border-indigo-100 text-indigo-700 font-semibold text-[11px] py-2 px-3 rounded-xl print:hidden flex items-center justify-center gap-1.5 shadow-sm">
                  <span className="text-amber-500 animate-pulse text-xs">💡</span> Sentuh &amp; cubit layar (pinch-to-zoom) untuk memperbesar silsilah
                </div>

                {/* Print Only Header */}
                <div className="hidden print:block text-center w-full mb-8 pb-4 border-b border-slate-200">
                  <h1 className="text-2xl font-black text-indigo-900">Bagan Silsilah Keluarga</h1>
                  <p className="text-slate-500 text-xs font-mono mt-1">
                    {treeViewMode === 'full' 
                      ? 'Bagan Keluarga Besar (Seluruh Dinasti)' 
                      : `Silsilah Terfokus - Tokoh Pusat: ${selectedRootName}`
                    }
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">Dicetak pada: {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>

                {familyData.length === 0 ? (
                  <div className="text-center text-slate-400 py-16">
                    <Users className="w-14 h-14 mx-auto text-slate-300 mb-3" />
                    <p className="text-sm font-bold text-slate-500">Tidak ada data untuk dirender.</p>
                    <button onClick={openNewMemberModal} className="text-xs text-indigo-600 font-bold hover:underline mt-2">Tambah anggota pertama</button>
                  </div>
                ) : treeViewMode === 'full' ? (
                  /* BAGAN KELUARGA BESAR MODE (Full recursive/hierarchical family chart) */
                  <div 
                    id="print-tree-canvas-wrapper"
                    className="flex flex-col items-center gap-16 min-w-max w-full origin-top transition-transform duration-200 ease-out py-4"
                    style={{ transform: `scale(${zoomLevel / 100})` }}
                  >
                    {fullTreeData.length === 0 ? (
                      <div className="text-center text-slate-400 py-12">
                        <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                        <p className="text-xs font-semibold">Gagal memproses struktur. Periksa link orang tua atau relasi silsilah.</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-24 items-center w-full">
                        {fullTreeData.map((rootNode, rIdx) => (
                          <div key={rIdx} className="w-full flex flex-col items-center border border-slate-100 bg-slate-50/30 p-10 lg:p-14 rounded-3xl relative">
                            <div className="absolute -top-3 left-6 bg-indigo-600 text-white text-[9px] font-mono font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                              Dinasti Silsilah #{rIdx + 1}
                            </div>
                            
                            {/* Visual header "SILSILAH KELUARGA BESAR" connected to Root node */}
                            <div className="flex flex-col items-center mb-6">
                              <div className="bg-gradient-to-r from-slate-900 to-indigo-900 text-white px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-md border-2 border-indigo-400/30 flex items-center gap-1.5">
                                <span className="text-amber-400">👑</span> SILSILAH KELUARGA BESAR
                              </div>
                              <div className="w-0.5 h-6 bg-slate-300" />
                            </div>

                            {renderFullTreeNode(rootNode)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  /* SILSILAH TERFOKUS MODE (Centered 3-generational view) */
                  <div 
                    id="print-tree-canvas-wrapper"
                    className="flex flex-col items-center gap-10 min-w-max w-full origin-top transition-transform duration-200 ease-out py-8"
                    style={{ transform: `scale(${zoomLevel / 100})` }}
                  >
                    {!selectedRootName ? (
                      <div className="text-center text-slate-400 py-12">
                        <Users className="w-12 h-12 mx-auto text-slate-300 mb-2" alt="" />
                        <p className="text-sm font-semibold">Tentukan tokoh pusat di dropdown atas.</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-10 min-w-[700px] w-full">
                        
                        {/* Visual header "SILSILAH KELUARGA BESAR" connected to Root node */}
                        <div className="flex flex-col items-center -mb-4">
                          <div className="bg-gradient-to-r from-slate-900 to-indigo-900 text-white px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-md border-2 border-indigo-400/30 flex items-center gap-1.5">
                            <span className="text-amber-400">👑</span> SILSILAH KELUARGA BESAR
                          </div>
                          <div className="w-0.5 h-8 bg-slate-300" />
                        </div>

                        {/* ROW 1: PARENTS (If exists) */}
                        {treeGraph.parents.length > 0 && (
                          <div className="flex flex-col items-center gap-4 w-full">
                            <div className="flex justify-center gap-6">
                              {treeGraph.parents.map((p, idx) => (
                                <div 
                                  key={idx}
                                  onClick={() => {
                                    if (familyData.some(x => x.namaLengkap.toLowerCase() === p.namaLengkap.toLowerCase())) {
                                      setSelectedRootName(p.namaLengkap);
                                    } else {
                                      if (window.confirm(`Anggota "${p.namaLengkap}" belum terdaftar lengkap. Registrasi sekarang?`)) {
                                        openAddRelationModalWithPrepopulate(p.namaLengkap);
                                      }
                                    }
                                  }}
                                  className="bg-slate-50 border border-slate-200 hover:border-indigo-600 hover:shadow-md hover:-translate-y-0.5 transition-all w-52 p-4 rounded-2xl text-center cursor-pointer relative"
                                >
                                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-slate-500 text-white font-mono text-[9px] px-2.5 py-0.5 rounded-full font-bold">Orang Tua</span>
                                  <img src={getAvatarUrl(p.foto, p.namaLengkap)} className="w-12 h-12 rounded-full object-cover mx-auto mb-2 border border-slate-200" alt="" />
                                  <div className="font-bold text-slate-800 text-xs truncate">{p.namaLengkap}</div>
                                  <span className="text-[10px] text-slate-400 block font-mono">Lahir: {p.tanggalLahir}</span>
                                </div>
                              ))}
                            </div>
                            <div className="w-0.5 h-8 bg-slate-300" />
                          </div>
                        )}

                        {/* ROW 2: ROOT AND PARTNER */}
                        <div className="flex justify-center gap-6 relative">
                          <div className="bg-indigo-50 border border-indigo-300 w-56 p-5 rounded-2xl text-center shadow-md relative">
                            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white font-mono text-[9px] px-2.5 py-0.5 rounded-full font-bold">AKAR (ROOT)</span>
                            <img src={getAvatarUrl(treeGraph.root?.foto, treeGraph.root?.namaLengkap || "")} className="w-14 h-14 rounded-full object-cover mx-auto mb-2 border-2 border-indigo-300" alt="" />
                            <div className="font-extrabold text-slate-900 text-sm truncate">{treeGraph.root?.namaLengkap}</div>
                            <span className="text-[10px] text-indigo-600 block font-mono font-semibold">Lahir: {treeGraph.root?.tanggalLahir}</span>
                            {treeGraph.root?.tanggalMeninggal && (
                              <span className="text-[9px] bg-slate-250 text-slate-600 px-2 py-0.5 rounded-full font-semibold mt-1 inline-block">Wafat: {treeGraph.root.tanggalMeninggal}</span>
                            )}
                          </div>

                          {treeGraph.spouse && (
                            <div 
                              onClick={() => {
                                if (treeGraph.spouse && familyData.some(x => x.namaLengkap.toLowerCase() === treeGraph.spouse!.namaLengkap.toLowerCase())) {
                                  setSelectedRootName(treeGraph.spouse.namaLengkap);
                                } else if (treeGraph.spouse) {
                                  if (window.confirm(`Pasangan "${treeGraph.spouse.namaLengkap}" belum terdaftar lengkap. Registrasi sekarang?`)) {
                                    openAddRelationModalWithPrepopulate(treeGraph.spouse.namaLengkap);
                                  }
                                }
                              }}
                              className="bg-pink-50/50 border border-pink-200 hover:border-pink-500 hover:shadow-md transition-all w-52 p-5 rounded-2xl text-center cursor-pointer relative"
                            >
                              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-pink-500 text-white font-mono text-[9px] px-2.5 py-0.5 rounded-full font-bold">PASANGAN</span>
                              <img src={getAvatarUrl(treeGraph.spouse.foto, treeGraph.spouse.namaLengkap)} className="w-12 h-12 rounded-full object-cover mx-auto mb-2 border border-pink-100" alt="" />
                              <div className="font-bold text-slate-800 text-xs truncate">{treeGraph.spouse.namaLengkap}</div>
                              <span className="text-[10px] text-pink-600 block font-mono">Lahir: {treeGraph.spouse.tanggalLahir}</span>
                            </div>
                          )}
                        </div>

                        {/* ROW 3: CHILDREN */}
                        {treeGraph.children.length > 0 && (
                          <div className="flex flex-col items-center gap-4 w-full">
                            <div className="w-0.5 h-8 bg-slate-300" />
                            <div className="flex justify-center gap-6 flex-wrap">
                              {treeGraph.children.map((c, idx) => (
                                <div 
                                  key={idx}
                                  onClick={() => {
                                    const exists = familyData.some(x => x.namaLengkap.toLowerCase() === c.namaLengkap.toLowerCase());
                                    if (exists) {
                                      setSelectedRootName(c.namaLengkap);
                                    } else {
                                      if (window.confirm(`Keturunan "${c.namaLengkap}" belum terdaftar dlm database. Registrasi sekarang?`)) {
                                        openAddRelationModalWithPrepopulate(c.namaLengkap);
                                      }
                                    }
                                  }}
                                  className="bg-slate-50 border border-slate-200 hover:border-indigo-600 hover:shadow-md hover:-translate-y-0.5 transition-all w-48 p-4 rounded-2xl text-center cursor-pointer relative"
                                >
                                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-sky-500 text-white font-mono text-[9px] px-2.5 py-0.5 rounded-full font-bold">Keturunan</span>
                                  <img src={getAvatarUrl(c.foto, c.namaLengkap)} className="w-12 h-12 rounded-full object-cover mx-auto mb-2 border border-slate-200" alt="" />
                                  <div className="font-bold text-slate-800 text-xs truncate">{c.namaLengkap}</div>
                                  <span className="text-[10px] text-slate-400 block font-mono">Lahir: {c.tanggalLahir}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 3: RECORDS DATABASE MANAGEMENT */}
          {activeTab === 'data' && (
            <div className="space-y-6">
              
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="font-extrabold text-slate-950 text-xl tracking-tight flex items-center gap-2">
                      <Database className="w-5.5 h-5.5 text-indigo-600" /> Manajemen Data Silsilah
                    </h3>
                    <p className="text-slate-400 text-xs mt-0.5 font-medium">Bebas mengelola rekam data. Hasil data yang diubah otomatis mensinkronisasi simulator.</p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button 
                      onClick={() => alert("Sistem Simulator: File PDF Landscape siap cetak dengan Blue Kop layout seperti spesifikasi. Unduh template murninya dengan mendownload 'Index.html' di tab integrasi.")}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer transition-all"
                    >
                      <FileText className="w-4 h-4 text-slate-500" /> Cetak PDF Silsilah
                    </button>
                    <button 
                      onClick={openNewMemberModal}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-md"
                    >
                      <Plus className="w-4 h-4" /> Tambah Anggota
                    </button>
                  </div>
                </div>

                {/* SEARCH FILTERS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                    <input 
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari Nama Anggota, Orang Tua..."
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 outline-none font-medium"
                    />
                  </div>

                  <div>
                    <select 
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full h-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-xs text-slate-700 outline-none font-medium"
                    >
                      <option value="all">Semua Status (Hidup &amp; Wafat)</option>
                      <option value="alive">Status: Masih Hidup</option>
                      <option value="deceased">Status: Sudah Wafat</option>
                    </select>
                  </div>

                  <div>
                    <select 
                      value={relationFilter} 
                      onChange={(e) => setRelationFilter(e.target.value)}
                      className="w-full h-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-xs text-slate-700 outline-none font-medium"
                    >
                      <option value="all">Semua Struktur Hubungan</option>
                      <option value="has_partner">Mempunyai Pasangan</option>
                      <option value="has_children">Mempunyai Anak</option>
                    </select>
                  </div>

                  <div>
                    <select 
                      value={lineageFilter} 
                      onChange={(e) => setLineageFilter(e.target.value)}
                      className="w-full h-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-xs text-slate-700 outline-none font-medium text-emerald-700"
                    >
                      <option value="all" className="text-slate-700">Kategori: Semua Silsilah</option>
                      <option value="descendants" className="text-slate-700">Kategori: Hanya Keturunan</option>
                      <option value="spouses" className="text-slate-700">Kategori: Hanya Pasangan</option>
                    </select>
                  </div>
                </div>

                {/* TABLE RENDER */}
                <div className="overflow-x-auto rounded-2xl border border-slate-100">
                  <table className="w-full border-collapse align-middle text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-100">
                      <tr>
                        <th className="py-3.5 px-4 w-16">Foto</th>
                        <th className="py-3.5 px-4">Nama Lengkap</th>
                        <th className="py-3.5 px-4">Pasangan</th>
                        <th className="py-3.5 px-4">Orang Tua</th>
                        <th className="py-3.5 px-4">Anak</th>
                        <th className="py-3.5 px-4">Tgl Lahir / Wafat</th>
                        <th className="py-3.5 px-4 text-center">Aksi / Relasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredData.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 bg-white text-center text-slate-400 font-medium">
                            <Database className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                            Database keluarga tidak ditemukan. Sila sesuaikan pencarian Anda.
                          </td>
                        </tr>
                      ) : (
                        [...filteredData].reverse().map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 bg-white transition-all">
                            <td className="py-3.5 px-4">
                              <img 
                                src={getAvatarUrl(item.foto, item.namaLengkap)} 
                                alt="" 
                                className="w-10 h-10 rounded-full object-cover border border-slate-200"
                              />
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="font-extrabold text-indigo-950 text-sm">{item.namaLengkap}</span>
                            </td>
                            <td className="py-3.5 px-4 font-medium text-slate-500">
                              {item.pasangan ? (
                                <span className="flex items-center gap-1.5 text-pink-600"><Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500" /> {item.pasangan}</span>
                              ) : "-"}
                            </td>
                            <td className="py-3.5 px-4 text-slate-400 font-medium">
                              {item.orangTua ? item.orangTua : "-"}
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex flex-wrap gap-1 max-w-[200px]">
                                {item.anak ? item.anak.split(',').map((kid, kIdx) => (
                                  <span key={kIdx} className="bg-slate-100 border border-slate-200/60 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded">
                                    {kid.trim()}
                                  </span>
                                )) : <span className="text-slate-350">-</span>}
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              {item.tanggalMeninggal && item.tanggalMeninggal.trim() !== "" ? (
                                <div>
                                  <span className="bg-slate-100 text-slate-650 px-2 py-0.5 rounded font-bold text-[9px] uppercase">Wafat</span>
                                  <div className="text-rose-500 font-mono text-[10px] mt-1">{item.tanggalLahir} s/d {item.tanggalMeninggal}</div>
                                </div>
                              ) : (
                                <div>
                                  <span className="bg-emerald-150 text-emerald-700 px-2 py-0.5 rounded font-bold text-[9px] uppercase">Hidup</span>
                                  <div className="text-slate-400 font-mono text-[10px] mt-1">{item.tanggalLahir}</div>
                                </div>
                              )}
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                <button 
                                  onClick={() => quickAddRelation(item.namaLengkap, 'partner')}
                                  className="border border-indigo-200 text-indigo-600 font-bold px-2 py-1 rounded hover:bg-indigo-50 text-[10px]"
                                >
                                  + Pasangan
                                </button>
                                <button 
                                  onClick={() => quickAddRelation(item.namaLengkap, 'child')}
                                  className="border border-sky-200 text-sky-600 font-bold px-2 py-1 rounded hover:bg-sky-50 text-[10px]"
                                >
                                  + Anak
                                </button>
                                <button 
                                  onClick={() => startEditMember(item)}
                                  className="p-1 px-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={() => deleteMember(item.namaLengkap)}
                                  className="p-1 px-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
            )}

        </main>
      </div>

      {/* POP-UP MODAL: ADD/EDIT FORM FOR PREVIEW */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
            
            {/* Modal header */}
            <div className="bg-indigo-950 text-white px-6 py-4 flex items-center justify-between">
              <h4 className="font-bold tracking-tight text-sm flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-400" />
                {isUpdate ? `Edit Rekor: ${formName}` : "Tambah Anggota Silsilah"}
              </h4>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-indigo-900 rounded-lg text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body form */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Name */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-650 mb-1.5">Nama Lengkap Anggota <span className="text-rose-500">*</span></label>
                  <input 
                    type="text"
                    ref={nameInputRef}
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Masukkan nama lengkap, gelar..."
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 rounded-xl px-4 py-2.5 text-xs outline-none font-medium"
                    required
                  />
                </div>

                {/* Spouse */}
                <div>
                  <label className="block text-xs font-bold text-slate-650 mb-1.5">Nama Pasangan (Suami/Istri)</label>
                  <input 
                    type="text"
                    value={formSpouse}
                    onChange={(e) => setFormSpouse(e.target.value)}
                    placeholder="Suami atau Istri"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 rounded-xl px-4 py-2.5 text-xs outline-none font-medium"
                  />
                </div>

                {/* Parents */}
                <div>
                  <label className="block text-xs font-bold text-slate-650 mb-1.5">Nama Orang Tua (Ayah/Ibu)</label>
                  <input 
                    type="text"
                    value={formParents}
                    onChange={(e) => setFormParents(e.target.value)}
                    placeholder="Nama Orang Tua"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 rounded-xl px-4 py-2.5 text-xs outline-none font-medium"
                  />
                </div>

                {/* Children */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-650 mb-1.5">Nama Anak-Anak</label>
                  <input 
                    type="text"
                    value={formChildren}
                    onChange={(e) => setFormChildren(e.target.value)}
                    placeholder="Contoh: Roni Santoso, Amalia Santoso (pisahkan dengan koma jika lebih dari satu)"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 rounded-xl px-4 py-2.5 text-xs outline-none font-medium"
                  />
                </div>

                {/* Birthdate */}
                <div>
                  <label className="block text-xs font-bold text-slate-650 mb-1.5">Tanggal Lahir <span className="text-rose-500">*</span></label>
                  <input 
                    type="date"
                    value={formBirthdate}
                    onChange={(e) => setFormBirthdate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 rounded-xl px-4 py-2.5 text-xs outline-none font-medium text-slate-705"
                    required
                  />
                </div>

                {/* Deceased details */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-650">Tanggal Wafat (Meninggal)</label>
                    <div className="flex items-center gap-1.5">
                      <input 
                        type="checkbox" 
                        id="form-deceased-chk"
                        checked={formDeceased}
                        onChange={(e) => setFormDeceased(e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label htmlFor="form-deceased-chk" className="text-[11px] font-bold text-slate-500 cursor-pointer">Wafat</label>
                    </div>
                  </div>
                  <input 
                    type="date"
                    value={formDeceasedDate}
                    onChange={(e) => setFormDeceasedDate(e.target.value)}
                    disabled={!formDeceased}
                    className="w-full bg-slate-50 disabled:bg-slate-100 disabled:opacity-55 border border-slate-200 focus:border-indigo-600 rounded-xl px-4 py-2.5 text-xs outline-none font-medium text-slate-705"
                  />
                </div>

                {/* Base64 upload & pre-loaded avatar */}
                <div className="md:col-span-2 bg-slate-50 border border-slate-150 p-4 rounded-2xl">
                  <span className="block text-xs font-bold text-slate-650 mb-2">Foto Profil (JPG / PNG)</span>
                  <div className="flex items-center gap-4">
                    <img 
                      src={getAvatarUrl(formFotoBase64, formName)} 
                      alt="" 
                      className="w-14 h-14 rounded-full object-cover border-2 border-slate-200 bg-white shadow-sm"
                    />
                    <div className="flex-1">
                      <input 
                        type="file" 
                        accept="image/png, image/jpeg, image/jpg"
                        onChange={handlePhotoUpload}
                        className="w-full bg-white border border-slate-200 rounded-xl text-xs px-3 py-2 cursor-pointer font-medium"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">Silakan upload foto maksimal berukuran 1MB.</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Modal footer submit */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 mt-6">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-slate-100 hover:bg-slate-250 text-slate-600 font-bold px-4 py-2.5 rounded-xl text-xs cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 hover:bg-indigo-700 cursor-pointer transition-colors disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Memproses...
                    </>
                  ) : "Simpan Anggota"}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
