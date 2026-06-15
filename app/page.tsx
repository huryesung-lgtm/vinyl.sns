"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"

const MOCK_MUSIC_DATABASE = [
  { id: "m1", title: "Hype Boy", artist: "NewJeans", cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=150", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { id: "m2", title: "Hype Boy (Sped Up Ver.)", artist: "NewJeans", cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { id: "m3", title: "TOMBOY", artist: "(G)I-DLE", cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=150", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
  { id: "m4", title: "락스타 (Rockstar)", artist: "Vinyl Man", cover: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=150", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" },
  { id: "m5", title: "새벽 드라이브 (Midnight Chill)", artist: "Lofi Room", cover: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=150", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3" }
]

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("home")
  
  const [isDark, setIsDark] = useState(true)

  const [username, setUsername] = useState("")
  const [isUsernameChecked, setIsUsernameChecked] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  
  const [postText, setPostText] = useState("")
  const [posts, setPosts] = useState<any[]>([])
  const [selectedPost, setSelectedPost] = useState<any>(null)
  const [commentText, setCommentText] = useState("")
  const [userPosts, setUserPosts] = useState<any[]>([])
  const [selectedTargetProfile, setSelectedTargetProfile] = useState<any>(null)
  const [profileSubTab, setProfileSubTab] = useState<"posts" | "reels">("posts")
  
  const [chats, setChats] = useState<any[]>([])
  const [activeChatUser, setActiveChatUser] = useState<any>(null)
  const [chatMessages, setChatMessages] = useState<any[]>([])
  const [messageInput, setMessageInput] = useState("")

  const [reels, setReels] = useState<any[]>([])
  const [userReels, setUserReels] = useState<any[]>([])
  const [currentReelIndex, setCurrentReelIndex] = useState(0)
  const [isEditing, setIsEditing] = useState(false)
  const [reelComments, setReelComments] = useState<any[]>([])
  const [newReelComment, setNewReelComment] = useState("")

  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null)
  const [playingMusicId, setPlayingMusicId] = useState<string | null>(null)
  const [attachedMusic, setAttachedMusic] = useState<any>(null)

  const bgColorsList = [
    "linear-gradient(to bottom right, #18181b, #09090b)", "linear-gradient(to bottom right, #312e81, #1e1b4b)", "linear-gradient(to bottom right, #064e3b, #022c22)", "linear-gradient(to bottom right, #4c1d95, #2e1065)", "linear-gradient(to bottom right, #7f1d1d, #450a0a)", "linear-gradient(to bottom right, #f8fafc, #cbd5e1)", "linear-gradient(to bottom right, #fdf4ff, #fbcfe8)"
  ]
  const [bgColor, setBgColor] = useState(bgColorsList[0])

  const [hasText, setHasText] = useState(false)
  const [textVal, setTextVal] = useState("")
  
  const [hasPoll, setHasPoll] = useState(false)
  const [pollQ, setPollQ] = useState("")
  const [pollOpts, setPollOpts] = useState(["네", "아니오"])
  const [votedPolls, setVotedPolls] = useState<Record<string, number>>({})

  const [hasQuestion, setHasQuestion] = useState(false)
  const [questionQ, setQuestionQ] = useState("")
  const [questionAnswerInput, setQuestionAnswerInput] = useState("")
  
  const [hasImageSticker, setHasImageSticker] = useState(false)
  const [stickerImageFile, setStickerImageFile] = useState<File | null>(null)
  const [stickerImagePreview, setStickerImagePreview] = useState<string | null>(null)

  const [selectedSticker, setSelectedSticker] = useState<string | null>(null)
  const [zOrder, setZOrder] = useState<string[]>(['image', 'music', 'text', 'poll', 'question'])

  const [positions, setPositions] = useState<any>({
    music: { x: 80, y: 150, scale: 1, rotate: 0 }, text: { x: 50, y: 320, scale: 1, rotate: 0 }, poll: { x: 40, y: 400, scale: 1, rotate: 0 }, question: { x: 40, y: 400, scale: 1, rotate: 0 }, image: { x: 60, y: 200, scale: 1, rotate: 0 }
  })
  
  const [interact, setInteract] = useState<any>({ type: 'none', key: null })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const wheelTimeout = useRef<NodeJS.Timeout | null>(null)

  const tBg = isDark ? "bg-zinc-950 text-zinc-100" : "bg-zinc-50 text-zinc-900"
  const tCard = isDark ? "bg-zinc-900/80 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
  const tInput = isDark ? "bg-zinc-950 border-zinc-800 text-zinc-200" : "bg-zinc-100 border-zinc-300 text-zinc-900"
  const tTextSec = isDark ? "text-zinc-400" : "text-zinc-500"

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('vinyl_theme')
    if (saved) setIsDark(saved === 'dark')
  }, [])

  useEffect(() => {
    if (mounted) localStorage.setItem('vinyl_theme', isDark ? 'dark' : 'light')
  }, [isDark, mounted])

  const bringToFront = (key: string) => setZOrder(prev => [...prev.filter(k => k !== key), key])

  useEffect(() => {
    if (activeTab !== "reels" || isEditing || reels.length === 0) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight") setCurrentReelIndex(p => Math.min(reels.length - 1, p + 1))
      else if (e.key === "ArrowUp" || e.key === "ArrowLeft") setCurrentReelIndex(p => Math.max(0, p - 1))
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [activeTab, isEditing, reels.length])

  const handleWheel = (e: React.WheelEvent) => {
    if (wheelTimeout.current || isEditing) return
    if (e.deltaY > 50) {
      setCurrentReelIndex(p => Math.min(reels.length - 1, p + 1))
      wheelTimeout.current = setTimeout(() => { wheelTimeout.current = null }, 600)
    } else if (e.deltaY < -50) {
      setCurrentReelIndex(p => Math.max(0, p - 1))
      wheelTimeout.current = setTimeout(() => { wheelTimeout.current = null }, 600)
    }
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user); if (user) checkProfile(user.id)
    })
  }, [])

  const checkProfile = async (userId: string) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle()
    setProfile(data || null)
  }

  const handleAuth = async (type: 'in'|'up') => {
    setLoading(true)
    const { data, error } = type === 'in' ? await supabase.auth.signInWithPassword({ email, password }) : await supabase.auth.signUp({ email, password })
    if (error) alert(error.message)
    else if (data.user && type === 'in') checkProfile(data.user.id)
    else if (type === 'up') alert("가입이 완료되었습니다! 로그인 해주세요.")
    setLoading(false)
  }

  // 🚪 로그아웃 기능 추가
  const handleSignOut = async () => {
    if (!confirm("로그아웃 하시겠습니까?")) return
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setActiveTab("home")
  }

  const fetchPosts = async () => {
    const { data } = await supabase.from("posts").select("*, profiles(username, tags), comments(*, profiles(username))").order("created_at", { ascending: false }).range(0, 100)
    if (data) setPosts(data)
  }

  const fetchUserPosts = async (targetUserId: string) => {
    const { data } = await supabase.from("posts").select("*, profiles(username)").eq("user_id", targetUserId).order("created_at", { ascending: false })
    setUserPosts(data || [])
  }

  const fetchReels = async () => {
    const { data } = await supabase.from("reels").select("*, profiles(username)").order("created_at", { ascending: false })
    setReels(data || [])
  }

  const fetchUserReels = async (targetUserId: string) => {
    const { data } = await supabase.from("reels").select("*").eq("user_id", targetUserId).order("created_at", { ascending: false })
    setUserReels(data || [])
  }

  const fetchReelComments = async (reelId: string) => {
    const { data } = await supabase.from("reel_comments").select("*, profiles(username)").eq("reel_id", reelId).order("created_at", { ascending: true })
    setReelComments(data || [])
  }

  const fetchChats = async () => {
    const { data } = await supabase.from("messages").select("sender_id, receiver_id, content, created_at, sender:profiles!messages_sender_id_fkey(id, username), receiver:profiles!messages_receiver_id_fkey(id, username)").order("created_at", { ascending: false })
    if (data) {
      const roomMap = new Map()
      data.forEach((msg: any) => {
        const otherUser = msg.sender_id === user.id ? msg.receiver : msg.sender
        if (!otherUser) return
        if (!roomMap.has(otherUser.id)) roomMap.set(otherUser.id, { user: otherUser, lastMessage: msg.content || "사진", time: msg.created_at })
      })
      setChats(Array.from(roomMap.values()))
    }
  }

  const fetchChatMessages = async (targetUserId: string) => {
    await supabase.from("messages").update({ is_read: true }).eq("receiver_id", user.id).eq("sender_id", targetUserId)
    const { data } = await supabase.from("messages").select("*, sender:profiles!messages_sender_id_fkey(username)").or(`and(sender_id.eq.${user.id},receiver_id.eq.${targetUserId}),and(sender_id.eq.${targetUserId},receiver_id.eq.${user.id})`).order("created_at", { ascending: true })
    setChatMessages(data || [])
  }

  useEffect(() => {
    if (profile) {
      if (activeTab === "home") fetchPosts()
      else if (activeTab === "reels") fetchReels()
      else if (activeTab === "messages") fetchChats()
      else if (activeTab === "profile") {
        const tid = selectedTargetProfile ? selectedTargetProfile.id : user.id
        fetchUserPosts(tid); fetchUserReels(tid)
      }
    }
  }, [profile, activeTab, selectedTargetProfile])

  const handleUserClick = async (userId: string) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle()
    if (data) { 
      setSelectedTargetProfile(data)
      setSelectedPost(null)
      setActiveTab("profile")
      setProfileSubTab("posts")
    }
  }

  const checkUsernameDuplicate = async () => {
    if (!username.trim()) return alert("닉네임을 입력해주세요.")
    setLoading(true)
    const { data } = await supabase.from("profiles").select("username").eq("username", username.trim())
    if (data && data.length > 0) setIsUsernameChecked(false)
    else setIsUsernameChecked(true)
    setLoading(false)
  }

  const handleSaveProfile = async () => {
    if (!username.trim() || !isUsernameChecked) return
    setLoading(true)
    const { error } = await supabase.from("profiles").insert([{ id: user.id, username: username.trim() }])
    if (!error) checkProfile(user.id)
    setLoading(false)
  }

  const handleCreatePost = async () => {
    if (!postText.trim()) return
    const { error } = await supabase.from("posts").insert([{ user_id: user.id, content: postText.trim() }])
    if (!error) { setPostText(""); fetchPosts() }
  }

  const handleCreateComment = async () => {
    if (!commentText.trim() || !selectedPost) return
    const { error } = await supabase.from("comments").insert([{ post_id: selectedPost.id, user_id: user.id, content: commentText.trim() }])
    if (!error) {
      setCommentText("")
      const { data } = await supabase.from("posts").select("*, profiles(username), comments(*, profiles(username))").eq("id", selectedPost.id).single()
      if (data) setSelectedPost(data)
    }
  }

  const handleSendMessage = async () => {
    if (!activeChatUser || !messageInput.trim()) return
    setLoading(true)
    const { error } = await supabase.from("messages").insert([{ sender_id: user.id, receiver_id: activeChatUser.id, content: messageInput.trim() }])
    if (!error) { setMessageInput(""); fetchChatMessages(activeChatUser.id) }
    setLoading(false)
  }

  const handleDeletePost = async (id: string) => {
    if (!confirm("이 게시물을 삭제하시겠습니까?")) return
    await supabase.from("posts").delete().eq("id", id)
    fetchPosts(); if (activeTab === "profile") fetchUserPosts(user.id)
  }

  const handleDeletePostComment = async (commentId: string, postId: string) => {
    if (!confirm("이 댓글을 삭제하시겠습니까?")) return
    await supabase.from("comments").delete().eq("id", commentId)
    if (selectedPost) {
      const { data } = await supabase.from("posts").select("*, profiles(username), comments(*, profiles(username))").eq("id", postId).single()
      if (data) setSelectedPost(data)
    }
  }

  const handleDeleteReel = async (id: string) => {
    if (!confirm("이 릴스 스토리를 삭제하시겠습니까?")) return
    await supabase.from("reels").delete().eq("id", id)
    fetchReels(); if (activeTab === "profile") fetchUserReels(user.id)
    setCurrentReelIndex(p => Math.max(0, p - 1))
  }

  const handleDeleteReelComment = async (id: string) => {
    if (!confirm("이 반응을 삭제하시겠습니까?")) return
    await supabase.from("reel_comments").delete().eq("id", id)
    fetchReelComments(reels[currentReelIndex].id)
  }

  const handleDeleteChat = async (targetUserId: string) => {
    if (!confirm("이 유저와의 모든 대화를 지우시겠습니까?")) return
    await supabase.from("messages").delete().or(`and(sender_id.eq.${user.id},receiver_id.eq.${targetUserId}),and(sender_id.eq.${targetUserId},receiver_id.eq.${user.id})`)
    setActiveChatUser(null); fetchChats()
  }

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return }
    const delay = setTimeout(async () => {
      try {
        const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(searchQuery)}&entity=song&limit=10`)
        const data = await res.json()
        const results = data.results.map((t: any) => ({
          id: t.trackId.toString(), title: t.trackName, artist: t.artistName, cover: t.artworkUrl100.replace("100x100bb", "300x300bb"), audio: t.previewUrl
        })).filter((t: any) => t.audio)
        setSearchResults(results)
      } catch (e) {}
    }, 400)
    return () => clearTimeout(delay)
  }, [searchQuery])

  useEffect(() => {
    if (activeTab === "reels" && reels.length > 0 && !isEditing) {
      const currentReel = reels[currentReelIndex]
      if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0 }
      audioRef.current = new Audio(currentReel.audio_url)
      audioRef.current.loop = true
      
      const playPromise = audioRef.current.play()
      if (playPromise !== undefined) playPromise.catch(() => {})
      
      fetchReelComments(currentReel.id)
    } else {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0 }
    }
    return () => { if (audioRef.current) { audioRef.current.pause() } }
  }, [activeTab, reels, currentReelIndex, isEditing])

  const handleTogglePreview = (music: any) => {
    if (previewAudio && playingMusicId === music.id) {
      previewAudio.pause(); setPreviewAudio(null); setPlayingMusicId(null)
    } else {
      if (previewAudio) previewAudio.pause()
      const nextAudio = new Audio(music.audio)
      nextAudio.loop = true
      const playPromise = nextAudio.play()
      if (playPromise !== undefined) playPromise.catch(() => {})
      setPreviewAudio(nextAudio); setPlayingMusicId(music.id)
    }
  }

  const handleAddMusicSticker = (music: any) => {
    if (!previewAudio || playingMusicId !== music.id) {
      if (previewAudio) previewAudio.pause()
      const nextAudio = new Audio(music.audio)
      nextAudio.loop = true
      const playPromise = nextAudio.play()
      if (playPromise !== undefined) playPromise.catch(() => {})
      setPreviewAudio(nextAudio); setPlayingMusicId(music.id)
    }
    setAttachedMusic(music); setSelectedSticker("music"); bringToFront("music")
  }

  const handleImageStickerUpload = (file: File) => {
    setStickerImageFile(file)
    setStickerImagePreview(URL.createObjectURL(file))
    setHasImageSticker(true)
    setSelectedSticker("image")
    bringToFront("image")
  }

  const startInteraction = (e: React.PointerEvent, key: string, type: 'move'|'resize'|'rotate') => {
    e.stopPropagation(); e.preventDefault(); setSelectedSticker(key); bringToFront(key)
    const node = document.getElementById(`sticker-${key}`); const parentNode = document.getElementById("canvas-board")
    if (!node || !parentNode) return
    const rect = node.getBoundingClientRect(); const parentRect = parentNode.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2; const centerY = rect.top + rect.height / 2
    const pos = positions[key]
    let startAngle = 0, startDist = 0
    if (type === 'rotate') startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI)
    else if (type === 'resize') startDist = Math.hypot(e.clientX - centerX, e.clientY - centerY)
    setInteract({ type, key, offsetX: e.clientX - parentRect.left - pos.x, offsetY: e.clientY - parentRect.top - pos.y, startScale: pos.scale, startRotate: pos.rotate, centerX, centerY, startAngle, startDist })
  }

  const handleCanvasPointerMove = (e: React.PointerEvent) => {
    if (interact.type === 'none' || !interact.key) return
    const key = interact.key; const pos = positions[key]
    if (interact.type === 'move') {
      const pRect = e.currentTarget.getBoundingClientRect()
      setPositions({ ...positions, [key]: { ...pos, x: e.clientX - pRect.left - interact.offsetX, y: e.clientY - pRect.top - interact.offsetY } })
    } else if (interact.type === 'rotate') {
      const delta = (Math.atan2(e.clientY - interact.centerY, e.clientX - interact.centerX) * (180 / Math.PI)) - interact.startAngle
      setPositions({ ...positions, [key]: { ...pos, rotate: interact.startRotate + delta } })
    } else if (interact.type === 'resize') {
      const dist = Math.hypot(e.clientX - interact.centerX, e.clientY - interact.centerY)
      setPositions({ ...positions, [key]: { ...pos, scale: Math.max(0.2, interact.startScale * (dist / interact.startDist)) } })
    }
  }

  const handleCanvasPointerUp = () => setInteract({ type: 'none', key: null })

  const handlePublishReel = async () => {
    if (!attachedMusic) return alert("공유할 음악을 추가해 주세요.")
    setLoading(true)
    let finalStickerImgUrl = null
    if (hasImageSticker && stickerImageFile) {
      const fName = `sticker_${user.id}_${Date.now()}.${stickerImageFile.name.split('.').pop()}`
      await supabase.storage.from("album-covers").upload(fName, stickerImageFile)
      finalStickerImgUrl = supabase.storage.from("album-covers").getPublicUrl(fName).data.publicUrl
    }
    const canvasData = {
      positions, zOrder, bgColor, finalStickerImgUrl,
      hasText, textVal, hasPoll, pollQ, pollOpts, hasQuestion, questionQ, hasImageSticker
    }
    const { error } = await supabase.from("reels").insert([{ user_id: user.id, music_title: attachedMusic.title, music_artist: attachedMusic.artist, album_cover_url: attachedMusic.cover, audio_url: attachedMusic.audio, canvas_data: canvasData }])
    if (!error) {
      setIsEditing(false); setAttachedMusic(null); setStickerImagePreview(null); setStickerImageFile(null)
      setHasText(false); setHasPoll(false); setHasQuestion(false); setHasImageSticker(false)
      setPollOpts(["네", "아니오"])
      if (previewAudio) { previewAudio.pause(); setPreviewAudio(null); }
      fetchReels()
    }
    setLoading(false)
  }

  const handleVoteToggle = (reelId: string, optIdx: number) => {
    if (votedPolls[reelId] === optIdx) {
      const next = { ...votedPolls }; delete next[reelId]; setVotedPolls(next)
    } else {
      setVotedPolls(prev => ({ ...prev, [reelId]: optIdx }))
    }
  }

  const handleAddReelComment = async (isQuestionAnswer = false) => {
    const content = isQuestionAnswer ? `[질문답변] ${questionAnswerInput}` : newReelComment
    if (!content.trim()) return
    const currentReel = reels[currentReelIndex]
    const { error } = await supabase.from("reel_comments").insert([{ reel_id: currentReel.id, user_id: user.id, content: content.trim() }])
    if (!error) { 
      setNewReelComment(""); setQuestionAnswerInput(""); fetchReelComments(currentReel.id) 
      if(isQuestionAnswer) alert("스토리 작성자에게 익명 답변이 전달되었습니다!")
    }
  }

  const renderBoundingBox = (key: string) => {
    if (selectedSticker !== key) return null
    return (
      <div className="absolute inset-0 border-2 border-indigo-500 pointer-events-none z-50 rounded-lg">
        <div onPointerDown={(e) => startInteraction(e, key, 'resize')} className="absolute -top-2 -left-2 w-4 h-4 bg-white border border-indigo-500 rounded-full cursor-nwse-resize pointer-events-auto" />
        <div onPointerDown={(e) => startInteraction(e, key, 'resize')} className="absolute -top-2 -right-2 w-4 h-4 bg-white border border-indigo-500 rounded-full cursor-nesw-resize pointer-events-auto" />
        <div onPointerDown={(e) => startInteraction(e, key, 'resize')} className="absolute -bottom-2 -left-2 w-4 h-4 bg-white border border-indigo-500 rounded-full cursor-nesw-resize pointer-events-auto" />
        <div onPointerDown={(e) => startInteraction(e, key, 'resize')} className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border border-indigo-500 rounded-full cursor-nwse-resize pointer-events-auto" />
        <div onPointerDown={(e) => startInteraction(e, key, 'rotate')} className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-md border border-neutral-300 flex items-center justify-center cursor-pointer pointer-events-auto text-black font-bold text-sm hover:scale-110 transition">↻</div>
      </div>
    )
  }

  if (!mounted) return null

  if (!user) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-screen ${tBg} p-4 transition-colors duration-300`}>
        <div className={`w-full max-w-sm p-8 rounded-2xl border shadow-2xl space-y-6 ${tCard}`}>
          <h1 className="text-2xl font-bold text-center tracking-widest text-indigo-500">VINYL BAR</h1>
          <input type="email" placeholder="Email" className={`w-full p-3 rounded-xl text-sm focus:outline-none border ${tInput}`} value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" className={`w-full p-3 rounded-xl text-sm focus:outline-none border ${tInput}`} value={password} onChange={(e) => setPassword(e.target.value)} />
          <button onClick={() => handleAuth('in')} className="w-full p-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700">Log In</button>
          <button onClick={() => handleAuth('up')} className={`w-full p-3 text-sm font-bold ${tTextSec} hover:underline`}>Sign Up</button>
        </div>
      </div>
    )
  }

  if (user && !profile) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-screen ${tBg} p-4 transition-colors duration-300`}>
        <div className={`w-full max-w-sm p-6 rounded-2xl border space-y-6 shadow-xl ${tCard}`}>
          <h2 className="text-lg font-bold text-indigo-500 text-center">초기 설정</h2>
          <input type="text" placeholder="닉네임 입력" className={`w-full p-2.5 rounded-xl text-sm focus:outline-none border ${tInput}`} value={username} onChange={(e) => setUsername(e.target.value)} />
          <button onClick={checkUsernameDuplicate} className={`w-full py-2 rounded-xl text-xs font-bold border ${tCard}`}>{isUsernameChecked ? "확인 완료" : "닉네임 중복확인"}</button>
          <button onClick={handleSaveProfile} disabled={!isUsernameChecked} className="w-full p-3 bg-indigo-600 text-white rounded-xl text-sm font-bold disabled:opacity-30">입장하기</button>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen pb-20 font-sans transition-colors duration-300 ${tBg}`} onClick={() => setSelectedSticker(null)}>
      <header className={`flex justify-between items-center px-6 py-4 border-b sticky top-0 z-50 h-[60px] ${tCard}`}>
        <h1 className="text-xl font-bold tracking-wider text-indigo-500 cursor-pointer" onClick={() => { setSelectedTargetProfile(null); setSelectedPost(null); setActiveTab("home"); }}>VINYL BAR</h1>
        <div className="flex items-center space-x-3">
          <button onClick={() => setIsDark(!isDark)} className="p-1.5 rounded-full bg-indigo-500/10 text-indigo-500 text-xs font-bold transition">{isDark ? '☀️ 라이트' : '🌙 다크'}</button>
          {activeTab === "reels" && !isEditing && (
            <button onClick={() => { setIsEditing(true); setAttachedMusic(null); }} className="text-xs px-3 py-1.5 bg-indigo-600 font-bold rounded-full text-white shadow-md hover:bg-indigo-700">+ 스토리 만들기</button>
          )}
          <button onClick={handleSignOut} className={`text-xs font-bold hover:underline ${tTextSec}`}>로그아웃</button>
        </div>
      </header>

      <main className={`mx-auto px-4 py-4 ${activeTab === "reels" || activeTab === "messages" ? "max-w-full flex justify-center" : "max-w-md"}`}>
        
        {/* 🎬 Reels Tab */}
        {activeTab === "reels" && (
          <div className="w-full flex flex-col items-center justify-center min-h-[80vh]">
            {isEditing ? (
              <div className="flex flex-col lg:flex-row gap-8 items-start justify-center w-full max-w-5xl animate-fadeIn">
                <div className={`border rounded-2xl p-5 w-full lg:w-80 space-y-4 text-xs h-[640px] overflow-y-auto shadow-xl scrollbar-hide ${tCard}`} onClick={(e) => e.stopPropagation()}>
                  <h3 className="font-bold text-indigo-500 border-b border-neutral-500/20 pb-2 text-sm">STORY DESIGNER</h3>

                  <div className="space-y-2">
                    <label className={`text-[10px] block ${tTextSec}`}>🎵 실시간 음악 검색 (재생 유지)</label>
                    <input type="text" placeholder="노래 검색" className={`w-full rounded-lg p-2 text-xs focus:outline-none border ${tInput}`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    {searchResults.length > 0 && (
                      <div className={`border rounded-xl overflow-hidden max-h-40 overflow-y-auto space-y-1 p-1 ${tCard}`}>
                        {searchResults.map(music => (
                          <div key={music.id} className="flex items-center justify-between p-1.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition">
                            <div className="flex items-center space-x-2 truncate flex-1">
                              <img src={music.cover} alt="Cv" className="w-7 h-7 object-cover rounded-md" />
                              <div className="truncate text-[11px]"><p className="font-bold truncate">{music.title}</p></div>
                            </div>
                            <div className="flex space-x-1 pl-1">
                              <button onClick={() => handleTogglePreview(music)} className={`px-1.5 py-0.5 rounded text-[10px] border ${tCard}`}>{playingMusicId === music.id ? "정지" : "듣기"}</button>
                              <button onClick={() => handleAddMusicSticker(music)} className="px-1.5 py-0.5 bg-indigo-600 rounded text-white font-bold text-[10px]">추가</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 border-t border-neutral-500/20 pt-3">
                    <label className={`text-[10px] block ${tTextSec}`}>🎨 배경 색상 지정</label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {bgColorsList.map((col, idx) => (
                        <button key={idx} style={{ background: col }} onClick={() => setBgColor(col)} className="h-6 rounded-md border border-neutral-500/30 hover:scale-105" />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-neutral-500/20 pt-3">
                    <label className={`text-[10px] block ${tTextSec}`}>📸 커스텀 및 상호작용</label>
                    <input type="file" id="img-file" accept="image/*" className="hidden" onChange={(e) => e.target.files && handleImageStickerUpload(e.target.files[0])} />
                    <label htmlFor="img-file" className={`block text-center p-2 border rounded-lg text-[10px] font-bold cursor-pointer hover:bg-black/5 transition ${tInput}`}>+ 사진 스티커 추가</label>
                    
                    <div className="flex justify-between items-center mt-2"><span>텍스트 쓰기</span><input type="checkbox" checked={hasText} onChange={(e) => setHasText(e.target.checked)} /></div>
                    {hasText && <input type="text" placeholder="문구 작성" className={`w-full rounded-lg p-2 border ${tInput}`} value={textVal} onChange={(e) => setTextVal(e.target.value)} onClick={() => {setSelectedSticker("text"); bringToFront("text");}} />}
                    
                    <div className="flex justify-between items-center"><span>투표 (다중 옵션)</span><input type="checkbox" checked={hasPoll} disabled={hasQuestion} onChange={(e) => { setHasPoll(e.target.checked); if(e.target.checked) setHasQuestion(false); }} /></div>
                    {hasPoll && (
                      <div className="space-y-1.5 pl-2 border-l-2 border-indigo-500">
                        <input type="text" placeholder="질문 작성" className={`w-full p-1.5 rounded border ${tInput}`} value={pollQ} onChange={(e) => setPollQ(e.target.value)} onClick={() => {setSelectedSticker("poll"); bringToFront("poll");}} />
                        {pollOpts.map((opt, i) => (
                          <input key={i} type="text" placeholder={`옵션 ${i+1}`} className={`w-full p-1.5 rounded border text-[10px] ${tInput}`} value={opt} onChange={(e) => { const n = [...pollOpts]; n[i] = e.target.value; setPollOpts(n); }} />
                        ))}
                        {pollOpts.length < 4 && <button onClick={() => setPollOpts([...pollOpts, ""])} className="text-[10px] text-indigo-500 font-bold">+ 옵션 추가</button>}
                      </div>
                    )}

                    <div className="flex justify-between items-center"><span>질문 받기 상자</span><input type="checkbox" checked={hasQuestion} disabled={hasPoll} onChange={(e) => { setHasQuestion(e.target.checked); if(e.target.checked) setHasPoll(false); }} /></div>
                    {hasQuestion && <input type="text" placeholder="인생이란?" className={`w-full p-1.5 rounded border ${tInput}`} value={questionQ} onChange={(e) => setQuestionQ(e.target.value)} onClick={() => {setSelectedSticker("question"); bringToFront("question");}} />}
                  </div>

                  <button onClick={handlePublishReel} disabled={loading} className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg mt-4">🚀 스토리 발행하기</button>
                  <button onClick={() => setIsEditing(false)} className={`w-full py-2 font-bold hover:underline ${tTextSec}`}>취소</button>
                </div>

                <div id="canvas-board" className="w-[360px] h-[640px] border border-neutral-500/30 rounded-3xl relative overflow-hidden shadow-2xl flex-shrink-0 touch-none select-none bg-black" style={{ background: bgColor }} onPointerMove={handleCanvasPointerMove} onPointerUp={handleCanvasPointerUp} onPointerLeave={handleCanvasPointerUp} onClick={(e) => e.stopPropagation()}>
                  {hasImageSticker && stickerImagePreview && (
                    <div id="sticker-image" onPointerDown={(e) => startInteraction(e, "image", 'move')} style={{ position: 'absolute', left: `${positions.image.x}px`, top: `${positions.image.y}px`, transform: `scale(${positions.image.scale}) rotate(${positions.image.rotate}deg)`, transformOrigin: 'center center', zIndex: zOrder.indexOf('image') + 10 }}>
                      <img src={stickerImagePreview} alt="Sticker" className="w-32 rounded-xl shadow-lg cursor-move pointer-events-none" />
                      {renderBoundingBox("image")}
                    </div>
                  )}

                  {attachedMusic && (
                    <div id="sticker-music" onPointerDown={(e) => startInteraction(e, "music", 'move')} style={{ position: 'absolute', left: `${positions.music.x}px`, top: `${positions.music.y}px`, transform: `scale(${positions.music.scale}) rotate(${positions.music.rotate}deg)`, transformOrigin: 'center center', zIndex: zOrder.indexOf('music') + 10 }}>
                      <div className="p-3 bg-black/80 border border-neutral-800 rounded-2xl w-48 shadow-2xl space-y-2 cursor-move pointer-events-none">
                        <img src={attachedMusic.cover} alt="Cv" className="w-full aspect-square object-cover rounded-xl" />
                        <div className="text-center"><p className="text-xs font-bold text-white truncate">{attachedMusic.title}</p><p className="text-[10px] text-neutral-400 truncate">{attachedMusic.artist}</p></div>
                      </div>
                      {renderBoundingBox("music")}
                    </div>
                  )}

                  {hasText && textVal && (
                    <div id="sticker-text" onPointerDown={(e) => startInteraction(e, "text", 'move')} style={{ position: 'absolute', left: `${positions.text.x}px`, top: `${positions.text.y}px`, transform: `scale(${positions.text.scale}) rotate(${positions.text.rotate}deg)`, transformOrigin: 'center center', zIndex: zOrder.indexOf('text') + 10 }}>
                      <div className="px-5 py-3 bg-white text-black text-sm font-bold rounded-full shadow-2xl whitespace-nowrap cursor-move pointer-events-none">{textVal}</div>
                      {renderBoundingBox("text")}
                    </div>
                  )}

                  {hasPoll && (
                    <div id="sticker-poll" onPointerDown={(e) => startInteraction(e, "poll", 'move')} style={{ position: 'absolute', left: `${positions.poll.x}px`, top: `${positions.poll.y}px`, transform: `scale(${positions.poll.scale}) rotate(${positions.poll.rotate}deg)`, transformOrigin: 'center center', zIndex: zOrder.indexOf('poll') + 10 }}>
                      <div className="p-4 bg-white border border-neutral-200 rounded-2xl w-64 shadow-2xl space-y-2 cursor-move pointer-events-none">
                        <p className="text-sm font-bold text-black text-center mb-2">📊 {pollQ || "투표 주제"}</p>
                        {pollOpts.map((opt, i) => (
                          <div key={i} className="bg-neutral-100 p-2 rounded-xl text-xs font-bold text-center text-neutral-500">{opt || `옵션 ${i+1}`}</div>
                        ))}
                      </div>
                      {renderBoundingBox("poll")}
                    </div>
                  )}

                  {hasQuestion && (
                    <div id="sticker-question" onPointerDown={(e) => startInteraction(e, "question", 'move')} style={{ position: 'absolute', left: `${positions.question.x}px`, top: `${positions.question.y}px`, transform: `scale(${positions.question.scale}) rotate(${positions.question.rotate}deg)`, transformOrigin: 'center center', zIndex: zOrder.indexOf('question') + 10 }}>
                      <div className="p-4 bg-white border border-neutral-200 rounded-2xl w-64 shadow-2xl space-y-3 cursor-move pointer-events-none">
                        <p className="text-sm font-bold text-indigo-600">❓ {questionQ || "질문해주세요"}</p>
                        <div className="bg-neutral-100 p-3 rounded-xl text-xs text-neutral-400">답변을 입력하세요...</div>
                      </div>
                      {renderBoundingBox("question")}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* 👀 조회 모드 */
              <div className="w-full max-w-5xl flex flex-col md:flex-row items-center justify-center gap-8 animate-fadeIn">
                {reels.length > 0 ? (
                  <>
                    <div className="flex flex-col items-center space-y-4 flex-shrink-0" onWheel={handleWheel}>
                      <div className="w-[360px] h-[640px] border border-neutral-500/20 rounded-3xl relative overflow-hidden shadow-2xl" style={{ background: reels[currentReelIndex].canvas_data?.bgColor || "#000" }}>
                        
                        {(reels[currentReelIndex].canvas_data?.zOrder || ['image', 'music', 'text', 'poll', 'question']).map((key: string, idx: number) => {
                          const pos = reels[currentReelIndex].canvas_data?.positions?.[key] || {x:0,y:0,scale:1,rotate:0}
                          const commonStyle = { position: 'absolute' as any, left: `${pos.x}px`, top: `${pos.y}px`, transform: `scale(${pos.scale}) rotate(${pos.rotate}deg)`, transformOrigin: 'center center', zIndex: idx + 10 }
                          
                          if (key === 'image' && reels[currentReelIndex].canvas_data?.hasImageSticker && reels[currentReelIndex].canvas_data?.finalStickerImgUrl) {
                            return <div key={key} style={commonStyle}><img src={reels[currentReelIndex].canvas_data.finalStickerImgUrl} className="w-32 rounded-xl shadow-lg" alt="" /></div>
                          }
                          if (key === 'music') {
                            return (
                              <div key={key} style={commonStyle}>
                                <div className="p-3 bg-black/80 border border-neutral-800 rounded-2xl w-48 shadow-2xl space-y-2">
                                  <img src={reels[currentReelIndex].album_cover_url} alt="Cover" className="w-full aspect-square object-cover rounded-xl" />
                                  <div className="text-center"><p className="text-xs font-bold text-white truncate">{reels[currentReelIndex].music_title}</p></div>
                                </div>
                              </div>
                            )
                          }
                          if (key === 'text' && reels[currentReelIndex].canvas_data?.hasText) {
                            return <div key={key} style={commonStyle}><div className="px-5 py-3 bg-white text-black text-sm font-bold rounded-full shadow-2xl whitespace-nowrap">{reels[currentReelIndex].canvas_data?.textVal}</div></div>
                          }
                          if (key === 'poll' && reels[currentReelIndex].canvas_data?.hasPoll) {
                            const reelId = reels[currentReelIndex].id
                            const myVoteIdx = votedPolls[reelId]
                            const isVoted = myVoteIdx !== undefined
                            const opts = reels[currentReelIndex].canvas_data?.pollOpts || []
                            
                            return (
                              <div key={key} style={commonStyle}>
                                <div className="p-4 bg-white rounded-2xl w-64 shadow-2xl space-y-2">
                                  <p className="text-sm font-bold text-black text-center mb-2">📊 {reels[currentReelIndex].canvas_data?.pollQ}</p>
                                  {opts.map((opt: string, i: number) => {
                                    const pct = isVoted ? (i === myVoteIdx ? 100 : 0) : 0
                                    return isVoted ? (
                                      <div key={i} onClick={() => handleVoteToggle(reelId, i)} className="relative bg-neutral-100 p-2.5 rounded-xl text-xs font-bold text-neutral-800 overflow-hidden flex justify-between cursor-pointer">
                                        <div className="absolute left-0 top-0 bottom-0 bg-indigo-200 transition-all duration-700" style={{ width: `${pct}%` }} />
                                        <span className="relative z-10">{opt}</span>
                                        <span className="relative z-10">{pct}%</span>
                                      </div>
                                    ) : (
                                      <button key={i} onClick={() => handleVoteToggle(reelId, i)} className="w-full bg-neutral-100 p-2.5 rounded-xl text-xs font-bold text-neutral-800 hover:bg-neutral-200 transition">{opt}</button>
                                    )
                                  })}
                                </div>
                              </div>
                            )
                          }
                          if (key === 'question' && reels[currentReelIndex].canvas_data?.hasQuestion) {
                            return (
                              <div key={key} style={commonStyle}>
                                <div className="p-4 bg-white rounded-2xl w-64 shadow-2xl space-y-3">
                                  <p className="text-sm font-bold text-indigo-600">❓ {reels[currentReelIndex].canvas_data?.questionQ}</p>
                                  <div className="flex space-x-1"><input type="text" placeholder="답변을 입력..." className="flex-1 bg-neutral-100 rounded-xl px-3 py-2 text-xs text-black focus:outline-none" value={questionAnswerInput} onChange={(e) => setQuestionAnswerInput(e.target.value)} /><button onClick={() => handleAddReelComment(true)} className="bg-indigo-600 text-white px-3 py-2 rounded-xl text-xs font-bold hover:bg-indigo-700">전송</button></div>
                                </div>
                              </div>
                            )
                          }
                          return null
                        })}

                        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center bg-black/50 p-3 rounded-2xl backdrop-blur-md border border-white/10 z-50">
                          <span className="text-xs font-bold text-white cursor-pointer hover:underline" onClick={() => handleUserClick(reels[currentReelIndex].user_id)}>@{reels[currentReelIndex].profiles?.username}</span>
                          {reels[currentReelIndex].user_id === user.id && (
                            <button onClick={() => handleDeleteReel(reels[currentReelIndex].id)} className="text-xs bg-red-600/90 text-white px-3 py-1 rounded-full font-bold hover:bg-red-700">스토리 삭제</button>
                          )}
                        </div>
                      </div>

                      <div className="flex space-x-4">
                        <button disabled={currentReelIndex === 0} onClick={() => setCurrentReelIndex(currentReelIndex - 1)} className={`px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-30 border transition ${tCard}`}>▲ 이전</button>
                        <button disabled={currentReelIndex === reels.length - 1} onClick={() => setCurrentReelIndex(currentReelIndex + 1)} className={`px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-30 border transition ${tCard}`}>▼ 다음</button>
                      </div>
                    </div>

                    <div className={`w-full md:w-80 h-[640px] border rounded-3xl p-4 flex flex-col justify-between shadow-xl ${tCard}`}>
                      <div className="space-y-3 flex-1 overflow-y-auto pr-1 scrollbar-hide">
                        <h4 className="text-xs font-bold text-indigo-500 tracking-wider uppercase border-b border-neutral-500/20 pb-2">💬 COMMENTS & Q&A</h4>
                        <div className="space-y-2">
                          {reelComments.map((comm) => (
                            <div key={comm.id} className={`p-3 border rounded-xl text-xs space-y-1 relative group ${comm.content.startsWith('[질문답변]') ? 'bg-indigo-500/10 border-indigo-500/30' : tInput}`}>
                              <p className="font-bold text-indigo-400">@{comm.profiles?.username}</p>
                              <p className="leading-relaxed whitespace-pre-wrap">{comm.content}</p>
                              {comm.user_id === user.id && (
                                <button onClick={() => handleDeleteReelComment(comm.id)} className="absolute top-2 right-2 text-red-500 font-bold opacity-0 group-hover:opacity-100">X</button>
                              )}
                            </div>
                          ))}
                          {reelComments.length === 0 && <p className={`text-xs text-center py-20 ${tTextSec}`}>반응을 남겨보세요.</p>}
                        </div>
                      </div>
                      <div className="flex space-x-2 pt-3 border-t border-neutral-500/20">
                        <input type="text" placeholder="일반 댓글 입력..." className={`flex-1 rounded-xl px-3 py-2 text-xs focus:outline-none border ${tInput}`} value={newReelComment} onChange={(e) => setNewReelComment(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddReelComment(false)} />
                        <button onClick={() => handleAddReelComment(false)} className="px-4 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-md">등록</button>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className={`text-sm py-12 ${tTextSec}`}>등록된 스토리가 없습니다.</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* 📝 Home Tab */}
        {activeTab === "home" && (
          <div className="space-y-6">
            <div className={`border rounded-2xl p-4 shadow-sm ${tCard}`}>
              {selectedPost ? (
                <div className="space-y-3">
                  <button onClick={() => setSelectedPost(null)} className={`text-xs font-bold hover:underline ${tTextSec}`}>← 뒤로 가기</button>
                  <div className="p-4 border rounded-xl space-y-2">
                    <span onClick={() => handleUserClick(selectedPost.user_id)} className="text-xs font-bold text-indigo-500 cursor-pointer">@{selectedPost.profiles?.username}</span>
                    <p className="text-sm">{selectedPost.content}</p>
                  </div>
                  <div className="pl-4 space-y-2">
                    {selectedPost.comments?.map((c: any) => (
                      <div key={c.id} className={`p-3 border rounded-xl text-xs space-y-1 relative group ${tInput}`}>
                        <span onClick={() => handleUserClick(c.user_id)} className="font-bold text-indigo-400 cursor-pointer">@{c.profiles?.username}</span>
                        <p>{c.content}</p>
                        {c.user_id === user.id && <button onClick={() => handleDeletePostComment(c.id, selectedPost.id)} className="absolute top-2 right-2 text-red-500 font-bold opacity-0 group-hover:opacity-100">X</button>}
                      </div>
                    ))}
                    <div className="flex space-x-2 pt-2">
                      <input type="text" placeholder="답글 달기..." className={`flex-1 rounded-xl px-3 py-2 text-xs focus:outline-none border ${tInput}`} value={commentText} onChange={(e) => setCommentText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCreateComment()} />
                      <button onClick={handleCreateComment} className="px-4 bg-indigo-600 text-white text-xs font-bold rounded-xl">등록</button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <textarea value={postText} onChange={(e) => setPostText(e.target.value)} placeholder="어떤 음악과 함께하고 계신가요?" className="w-full bg-transparent text-sm focus:outline-none h-20 resize-none" />
                  <div className="flex justify-end border-t border-neutral-500/20 pt-3 mt-2">
                    <button onClick={handleCreatePost} className="px-6 py-2 bg-indigo-600 text-white text-xs font-bold rounded-full shadow-md">Post</button>
                  </div>
                </>
              )}
            </div>
            {!selectedPost && (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div key={post.id} className={`border p-5 rounded-2xl space-y-3 shadow-sm ${tCard}`}>
                    <div className="flex justify-between items-center">
                      <span onClick={() => handleUserClick(post.user_id)} className="text-xs font-bold text-indigo-500 hover:underline cursor-pointer">@{post.profiles?.username}</span>
                      <div className="flex items-center space-x-3">
                        <span className={`text-[10px] ${tTextSec}`}>{new Date(post.created_at).toLocaleDateString()}</span>
                        {post.user_id === user.id && <button onClick={() => handleDeletePost(post.id)} className="text-[10px] text-red-500 font-bold hover:underline">삭제</button>}
                      </div>
                    </div>
                    <p onClick={() => setSelectedPost(post)} className="text-sm leading-relaxed cursor-pointer">{post.content}</p>
                    <p className={`text-[10px] ${tTextSec}`}>💬 답글 {post.comments?.length || 0}개</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 💬 Messages Tab */}
        {activeTab === "messages" && (
          <div className="w-full">
            {activeChatUser ? (
              <div className={`flex flex-col justify-between h-[calc(100vh-140px)] w-full relative border rounded-2xl p-4 shadow-md ${tCard}`}>
                <div className="flex justify-between items-center border-b border-neutral-500/20 pb-3">
                  <button onClick={() => { setActiveChatUser(null); fetchChats(); }} className={`text-xs font-bold ${tTextSec} hover:text-indigo-500`}>← 대화 목록으로</button>
                  <button onClick={() => handleDeleteChat(activeChatUser.id)} className="text-xs font-bold text-red-500 hover:underline">대화방 삭제</button>
                </div>
                <div className="flex-1 overflow-y-auto rounded-xl py-4 flex flex-col space-y-3 w-full scrollbar-hide">
                  {chatMessages.map((msg) => {
                    const isMe = msg.sender_id === user.id
                    return (
                      <div key={msg.id} className={`max-w-[70%] p-3.5 rounded-2xl text-xs space-y-2 flex flex-col shadow-sm ${isMe ? "bg-indigo-600 text-white self-end rounded-tr-none" : `${tInput} self-start rounded-tl-none`}`}>
                        <p className="leading-relaxed">{msg.content}</p>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>
                <div className="flex space-x-2 items-center w-full pt-3 border-t border-neutral-500/20">
                  <input type="text" placeholder="메시지 전송..." className={`flex-1 border rounded-xl px-4 py-3 text-xs focus:outline-none ${tInput}`} value={messageInput} onChange={(e) => setMessageInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} />
                  <button onClick={handleSendMessage} className="px-6 py-3 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-md">전송</button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 w-full h-[calc(100vh-140px)] overflow-y-auto">
                <h3 className={`text-sm font-bold tracking-wide pl-1 border-b border-neutral-500/20 pb-2 ${tTextSec}`}>MESSAGE HOME</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {chats.map((chat) => (
                    <div key={chat.user.id} onClick={() => { setActiveChatUser(chat.user); fetchChatMessages(chat.user.id); }} className={`border p-4 rounded-xl flex justify-between items-center cursor-pointer shadow-sm hover:border-indigo-500 transition ${tCard}`}>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-indigo-500">@{chat.user.username}</p>
                        <p className={`text-xs truncate max-w-[250px] ${tTextSec}`}>{chat.lastMessage}</p>
                      </div>
                    </div>
                  ))}
                  {chats.length === 0 && <p className={`text-xs py-10 pl-2 ${tTextSec}`}>진행 중인 대화가 없습니다.</p>}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 📀 Profile Tab */}
        {activeTab === "profile" && (
          <div className="space-y-6 pt-4">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full mx-auto flex items-center justify-center text-3xl shadow-xl">📀</div>
              <h2 className="text-xl font-bold">@{selectedTargetProfile ? selectedTargetProfile.username : profile?.username}'s BAR</h2>
              {selectedTargetProfile && selectedTargetProfile.id !== user.id && (
                <button onClick={() => { setActiveChatUser(selectedTargetProfile); setActiveTab("messages"); fetchChatMessages(selectedTargetProfile.id); }} className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-full shadow-lg">💬 메시지 보내기</button>
              )}
            </div>
            <div className="border-t border-neutral-500/20 pt-2 space-y-4">
              <div className="flex border-b border-neutral-500/20 text-xs">
                <button onClick={() => setProfileSubTab("posts")} className={`flex-1 py-3 font-bold text-center border-b-2 transition-colors ${profileSubTab === "posts" ? "border-indigo-500 text-indigo-500" : `border-transparent ${tTextSec}`}`}>일반 게시글</button>
                <button onClick={() => setProfileSubTab("reels")} className={`flex-1 py-3 font-bold text-center border-b-2 transition-colors ${profileSubTab === "reels" ? "border-purple-500 text-purple-500" : `border-transparent ${tTextSec}`}`}>릴스 앨범룸</button>
              </div>
              {profileSubTab === "posts" ? (
                <div className="space-y-3">
                  {userPosts.map((post) => (
                    <div key={post.id} className={`border p-4 rounded-xl text-xs space-y-2 shadow-sm ${tCard}`}>
                      <div className="flex justify-between items-center">
                        <span className={`text-[10px] ${tTextSec}`}>{new Date(post.created_at).toLocaleDateString()}</span>
                        {post.user_id === user.id && <button onClick={() => handleDeletePost(post.id)} className="text-[10px] text-red-500 font-bold hover:underline">삭제</button>}
                      </div>
                      <p className="leading-relaxed">{post.content}</p>
                    </div>
                  ))}
                  {userPosts.length === 0 && <p className={`text-xs text-center py-10 ${tTextSec}`}>작성한 글이 없습니다.</p>}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {userReels.map((ur, idx) => (
                    <div key={ur.id} className="relative aspect-square bg-neutral-900 rounded-xl overflow-hidden cursor-pointer group shadow-sm" onClick={() => { setActiveTab("reels"); setCurrentReelIndex(idx); }}>
                      <img src={ur.album_cover_url} alt="Cv" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      {ur.user_id === user.id && (
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteReel(ur.id); }} className="absolute top-2 right-2 bg-red-600/90 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">🗑️</button>
                      )}
                    </div>
                  ))}
                  {userReels.length === 0 && <p className={`col-span-3 text-xs text-center py-10 ${tTextSec}`}>발행한 스토리가 없습니다.</p>}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <nav className={`fixed bottom-0 left-0 right-0 border-t flex justify-around py-2 z-50 h-[60px] pb-safe ${tCard}`}>
        {[{ id: "home", label: "Home" }, { id: "reels", label: "Reels" }, { id: "messages", label: "Messages" }, { id: "profile", label: "My Bar" }].map((tab) => (
          <button key={tab.id} onClick={() => { if (tab.id === "profile") setSelectedTargetProfile(null); setActiveTab(tab.id); setIsEditing(false); }} className={`flex flex-col items-center justify-center w-full text-[11px] font-bold transition-colors ${activeTab === tab.id ? "text-indigo-500" : tTextSec}`}>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}