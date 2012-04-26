require 'mail'
require_relative 'mailsettings'

Mail.defaults do
  retriever_method :imap, :address    => MailSettings.imapServer(),
    :port       => MailSettings.port(),
    :user_name  => MailSettings.user_name(),
    :password   => MailSettings.password(),
    :enable_ssl => MailSettings.enable_ssl()
end

#emails = Mail.all
#emails.length
#print emails.length
first = Mail.first
print first.from
print first.subject
print first.parts.length

