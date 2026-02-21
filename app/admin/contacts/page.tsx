'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { Mail, Eye, EyeOff, Archive, Trash2, Search, Filter, CheckCircle, Clock, MessageCircle } from 'lucide-react'

interface ContactMessage {
  id: number
  first_name: string
  last_name: string
  email: string
  subject: string
  message: string
  status: 'new' | 'read' | 'replied' | 'archived'
  created_at: string
}

export default function AdminContacts() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [filteredMessages, setFilteredMessages] = useState<ContactMessage[]>([])
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    fetchMessages()
  }, [])

  useEffect(() => {
    filterMessages()
  }, [messages, searchTerm, statusFilter])

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/admin/contacts')
      const data = await response.json()
      
      if (data.success) {
        setMessages(data.messages)
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterMessages = () => {
    let result = messages

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(msg => 
        msg.first_name.toLowerCase().includes(term) ||
        msg.last_name.toLowerCase().includes(term) ||
        msg.email.toLowerCase().includes(term) ||
        msg.subject.toLowerCase().includes(term) ||
        msg.message.toLowerCase().includes(term)
      )
    }

    if (statusFilter !== 'all') {
      result = result.filter(msg => msg.status === statusFilter)
    }

    setFilteredMessages(result)
  }

  const markAsRead = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/contacts?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'read' }),
      })

      if (response.ok) {
        const updatedMessages = messages.map(msg => 
          msg.id === id ? { ...msg, status: 'read' as const } : msg
        )
        setMessages(updatedMessages)
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Failed to update message status:', error)
    }
  }

  const markAsArchived = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/contacts?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'archived' }),
      })

      if (response.ok) {
        const updatedMessages = messages.map(msg => 
          msg.id === id ? { ...msg, status: 'archived' as const } : msg
        )
        setMessages(updatedMessages)
        if (messages.find(msg => msg.id === id)?.status === 'new') {
          setUnreadCount(prev => Math.max(0, prev - 1))
        }
      }
    } catch (error) {
      console.error('Failed to archive message:', error)
    }
  }

  const deleteMessage = async (id: number) => {
    if (confirm('Are you sure you want to delete this message?')) {
      try {
        const response = await fetch(`/api/admin/contacts?id=${id}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          const updatedMessages = messages.filter(msg => msg.id !== id)
          setMessages(updatedMessages)
          if (messages.find(msg => msg.id === id)?.status === 'new') {
            setUnreadCount(prev => Math.max(0, prev - 1))
          }
          if (selectedMessage?.id === id) {
            setSelectedMessage(null)
          }
        }
      } catch (error) {
        console.error('Failed to delete message:', error)
      }
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-primary-900/30 text-primary-400'
      case 'read':
        return 'bg-secondary-800 text-secondary-300'
      case 'replied':
        return 'bg-green-900/30 text-green-400'
      case 'archived':
        return 'bg-purple-900/30 text-purple-400'
      default:
        return 'bg-secondary-800 text-secondary-300'
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Contact Messages</h1>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-900/30 text-primary-400">
              <Mail className="h-4 w-4 mr-1" />
              {unreadCount} unread
            </span>
          </div>
        </div>

        <div className="bg-secondary-900 shadow rounded-lg mb-6 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex flex-1 space-x-2">
              <div className="relative flex-1 max-w-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-secondary-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-secondary-700 rounded-md leading-5 bg-secondary-900 placeholder-secondary-500 focus:outline-none focus:placeholder-secondary-500 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="relative">
                <select
                  className="block appearance-none w-full bg-secondary-900 border border-secondary-700 text-secondary-300 py-2 px-4 pr-8 rounded-md leading-tight focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="new">New</option>
                  <option value="read">Read</option>
                  <option value="replied">Replied</option>
                  <option value="archived">Archived</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <Filter className="h-4 w-4 text-secondary-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className={`${selectedMessage ? 'lg:w-2/5' : 'w-full'} bg-secondary-900 shadow rounded-lg overflow-hidden`}>
            <div className="border-b border-secondary-800 bg-secondary-900 px-6 py-4">
              <h2 className="text-lg font-medium text-white">Messages</h2>
            </div>
            
            <div className="divide-y divide-secondary-800 max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="p-6 text-center text-secondary-400">Loading messages...</div>
              ) : filteredMessages.length === 0 ? (
                <div className="p-6 text-center text-secondary-400">No messages found</div>
              ) : (
                filteredMessages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`p-4 hover:bg-secondary-950 cursor-pointer transition-colors ${
                      selectedMessage?.id === message.id ? 'bg-primary-900/30' : ''
                    } ${message.status === 'new' ? 'bg-primary-900/20' : ''}`}
                    onClick={() => {
                      setSelectedMessage(message)
                      if (message.status === 'new') {
                        markAsRead(message.id)
                      }
                    }}
                  >
                    <div className="flex justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-900/30 flex items-center justify-center">
                          <MessageCircle className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-white">
                            {message.first_name} {message.last_name}
                          </p>
                          <p className="text-sm text-secondary-400">{message.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(message.status)}`}>
                          {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                        </span>
                        {message.status === 'new' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-900/30 text-primary-400">
                            <Clock className="h-3 w-3 mr-1" /> New
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm font-medium text-white">{message.subject}</p>
                      <p className="mt-1 text-sm text-secondary-400 line-clamp-2">
                        {message.message.length > 100 
                          ? message.message.substring(0, 100) + '...' 
                          : message.message}
                      </p>
                    </div>
                    <div className="mt-2 flex justify-between items-center">
                      <p className="text-xs text-secondary-400">
                        {formatDate(message.created_at)}
                      </p>
                      <div className="flex space-x-1">
                        {message.status !== 'archived' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              markAsArchived(message.id)
                            }}
                            className="text-secondary-400 hover:text-secondary-400"
                          >
                            <Archive className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteMessage(message.id)
                          }}
                          className="text-secondary-400 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {selectedMessage && (
            <div className="lg:w-3/5 bg-secondary-900 shadow rounded-lg overflow-hidden">
              <div className="border-b border-secondary-800 bg-secondary-900 px-6 py-4 flex justify-between items-center">
                <h2 className="text-lg font-medium text-white">Message Details</h2>
                <div className="flex space-x-2">
                  {selectedMessage.status !== 'archived' && (
                    <button
                      onClick={() => markAsArchived(selectedMessage.id)}
                      className="inline-flex items-center px-3 py-1 border border-secondary-700 shadow-sm text-sm leading-4 font-medium rounded-md text-secondary-300 bg-secondary-900 hover:bg-secondary-950 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      <Archive className="h-4 w-4 mr-1" /> Archive
                    </button>
                  )}
                  <button
                    onClick={() => deleteMessage(selectedMessage.id)}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-sm font-medium text-secondary-400">From</h3>
                    <p className="mt-1 text-sm text-white">{selectedMessage.first_name} {selectedMessage.last_name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-secondary-400">Email</h3>
                    <p className="mt-1 text-sm text-white">{selectedMessage.email}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-secondary-400">Subject</h3>
                    <p className="mt-1 text-sm text-white">{selectedMessage.subject}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-secondary-400">Date</h3>
                    <p className="mt-1 text-sm text-white">{formatDate(selectedMessage.created_at)}</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-secondary-400">Message</h3>
                  <div className="mt-2 bg-secondary-950 rounded-lg p-4">
                    <p className="text-sm text-white whitespace-pre-line">{selectedMessage.message}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedMessage.status)}`}>
                    {selectedMessage.status.charAt(0).toUpperCase() + selectedMessage.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}