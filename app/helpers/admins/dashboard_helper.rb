module Admins::DashboardHelper
    def render_flash_stream
        turbo_stream.update "flash", partial: "application/flash"
    end
end
